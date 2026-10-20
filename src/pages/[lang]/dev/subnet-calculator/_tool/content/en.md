## How to use

Enter an IP address with a prefix (`192.168.1.10/24`) or a mask (`10.0.0.0 255.255.0.0`). You'll get the network address, subnet mask and wildcard mask, broadcast address, the usable host range and how many hosts it holds.

To divide a network, pick a new prefix under “Split into subnets” — say, a /24 into four /26 subnets — and you’ll get the network, range and broadcast address of each. The address and mask are also shown in binary, so you can see which bits belong to the network and which to hosts.

## Example

`192.168.1.10/24`:

- network `192.168.1.0/24`, mask `255.255.255.0`;
- broadcast `192.168.1.255`;
- host range `192.168.1.1 – 192.168.1.254` — **254** usable addresses.

## How it works

`/24` means the first 24 bits identify the network and the remaining 8 identify the host. That's 2⁸ = 256 addresses, but the first (network) and last (broadcast) aren't assigned to hosts, leaving 254. For `/31` (point-to-point links, RFC 3021) and `/32` (a single address), those two aren't subtracted.

## FAQ

**What are private networks?** `10.0.0.0/8`, `172.16.0.0/12` and `192.168.0.0/16` (RFC 1918) are used inside home and office networks and aren't routed on the internet.

**What's a wildcard mask for?** Cisco ACLs and OSPF use it: bits set to 1 mean "any value".

**Is IPv6 supported?** Not yet — IPv4 only.
