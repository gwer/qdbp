import fs from 'node:fs';
import path from 'node:path';
import {registerHooks} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from '/home/gwer/code/qdbp/node_modules/typescript/lib/typescript.js';
registerHooks({
  resolve(specifier,context,nextResolve){
    if(specifier.endsWith('?url'))return {url:'qdbp-audit-asset:'+encodeURIComponent(specifier),shortCircuit:true};
    if(specifier.startsWith('@/')||(specifier.startsWith('.')&&/\.(ts|tsx)$/.test(context.parentURL??''))){
      let p=specifier.startsWith('@/')?'/home/gwer/code/qdbp/src/'+specifier.slice(2):fileURLToPath(new URL(specifier,context.parentURL));
      for(const ext of ['', '.ts','.tsx','.js','.json']) if(fs.existsSync(p+ext)&&fs.statSync(p+ext).isFile())return nextResolve(pathToFileURL(p+ext).href,context);
    }
    return nextResolve(specifier,context);
  },
  load(url,context,nextLoad){
    if(url.startsWith('qdbp-audit-asset:'))return {format:'module',shortCircuit:true,source:'export default "unused-in-pure-compute-audit";'};
    if(/\.(ts|tsx)$/.test(url))return {format:'module',shortCircuit:true,source:ts.transpileModule(fs.readFileSync(fileURLToPath(url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,jsxImportSource:'preact',verbatimModuleSyntax:true}}).outputText};
    return nextLoad(url,context);
  }
});
