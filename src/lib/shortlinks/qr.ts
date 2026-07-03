import 'server-only';
// 단축 URL → QR 데이터 URL 생성(서버 전용). 이미지 저장 없이 렌더 시 생성(5.8).
import QRCode from 'qrcode';

export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 240 });
}
