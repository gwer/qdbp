export {root,langs,inventory,launch,sleep,inspect} from './audit.mjs';
// Override for subsequent acceptance rounds; the original evidence stays immutable by default.
export const out=process.env.QDBP_RECHECK_DIR??'/home/gwer/code/qdbp/docs/reviews/20261020/evidence/recheck';
import fs from 'node:fs';
fs.mkdirSync(out+'/evidence',{recursive:true});
