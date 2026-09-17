import { ImageResponse } from 'next/og';

export const alt = 'UGC Deal Decoder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
          fontFamily: 'sans-serif'
        }}
      >
        <div
          style={{
            fontSize: 30,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 16
          }}
        >
          UGC
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -2,
            lineHeight: 1
          }}
        >
          Deal Decoder
        </div>
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.9)',
            marginTop: 28
          }}
        >
          Know if a brand deal is fair before you sign
        </div>
      </div>
    ),
    { ...size }
  );
}
