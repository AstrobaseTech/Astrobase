export const encodes: [ascii: string, bytes: Uint8Array, base64: string, bech32m: string][] = [
  ['', new Uint8Array(), '', 'test1ltnwvs'],
  ['L1br3', new Uint8Array([0x4c, 0x31, 0x62, 0x72, 0x33]), 'TDFicjM=', 'test1fsckyu3nm4g25h'],
  ['B4s3d', new Uint8Array([0x42, 0x34, 0x73, 0x33, 0x64]), 'QjRzM2Q=', 'test1gg68xvmy64uvke'],
  ['Howdy', new Uint8Array([0x48, 0x6f, 0x77, 0x64, 0x79]), 'SG93ZHk=', 'test1fphhwere7l9krw'],
] as const;
