/**
 * 실제 위경도(WGS84) → SVG 좌표 변환
 * viewBox: "80 48 880 650"  (x: 80~960, y: 48~698)
 *
 * 서울 경계:
 *   lng: 126.78 ~ 127.22  (0.44°)
 *   lat: 37.42  ~ 37.71   (0.29°)
 */
import { STATION_LATLNG } from './stationLatLng';

const LNG_MIN = 126.78,  LNG_SPAN = 0.44;
const LAT_MAX = 37.71,   LAT_SPAN = 0.29;
const W = 880, H = 650, PX = 80, PY = 48;

export function project(lat, lng) {
  return {
    x: Math.round((lng - LNG_MIN) / LNG_SPAN * W + PX),
    y: Math.round((LAT_MAX - lat)  / LAT_SPAN * H + PY),
  };
}

// 2호선 지선 좌표 수동 보정 (원본 데이터 오류 수정)
const OVERRIDES = {
  '2': {
    '신설동':    { lat: 37.5761056, lng: 127.0245335 }, // 1호선 신설동과 동일
    '용두':      { lat: 37.5761056, lng: 127.0300000 },
    '신답':      { lat: 37.5704687, lng: 127.0471946 },
    '용답':      { lat: 37.5659035, lng: 127.0494423 },
    '신정네거리':{ lat: 37.5208000, lng: 126.8535000 },
  },
};

export const LINE_COORDS = Object.fromEntries(
  Object.entries(STATION_LATLNG).map(([line, stations]) => [
    line,
    stations.map(s => {
      const ov = OVERRIDES[line]?.[s.name];
      const { lat, lng } = ov ?? s;
      return { name: s.name, ...project(lat, lng) };
    }),
  ])
);
