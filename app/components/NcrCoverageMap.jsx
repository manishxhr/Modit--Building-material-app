'use client';

import { useMemo, useState } from 'react';

const zoneShapes = [
  { key: 'Delhi', score: 88, path: 'M26 56 L64 32 L104 52 L102 100 L66 118 L28 96 Z', hue: '#4f83c7' },
  { key: 'Gurugram', score: 94, path: 'M14 122 L48 108 L82 126 L80 164 L42 178 L10 154 Z', hue: '#2bb673' },
  { key: 'Noida', score: 91, path: 'M112 58 L150 46 L184 72 L182 110 L144 124 L110 98 Z', hue: '#5f9ce2' },
  { key: 'Faridabad', score: 82, path: 'M88 132 L124 120 L158 142 L152 178 L116 194 L84 170 Z', hue: '#4f83c7' },
  { key: 'Ghaziabad', score: 79, path: 'M164 90 L196 82 L228 104 L226 140 L192 152 L160 128 Z', hue: '#6ca9e9' },
  { key: 'Greater Noida', score: 84, path: 'M176 146 L212 136 L242 156 L240 192 L204 206 L172 184 Z', hue: '#3f74b6' }
];

export default function NcrCoverageMap({ suppliers = [] }) {
  const [selected, setSelected] = useState('Gurugram');

  const zoneData = useMemo(() => {
    return zoneShapes.map((zone) => {
      const inZone = suppliers.filter((supplier) => supplier.city === zone.key);
      const avgRating = inZone.length
        ? (inZone.reduce((sum, supplier) => sum + Number(supplier.rating || 0), 0) / inZone.length).toFixed(1)
        : 'N/A';
      const avgDispatch = inZone.length
        ? Math.round(inZone.reduce((sum, supplier) => sum + Number(supplier.delivery || 0), 0) / inZone.length)
        : null;

      return {
        ...zone,
        suppliers: inZone.length,
        avgRating,
        avgDispatch,
      };
    });
  }, [suppliers]);

  const active = zoneData.find((zone) => zone.key === selected) || zoneData[0];

  return (
    <div className="ncr-map-shell">
      <div className="ncr-map-stage" role="img" aria-label="Delhi NCR supplier coverage map">
        <svg viewBox="0 0 260 220" className="ncr-map-svg">
          {zoneData.map((zone) => (
            <path
              key={zone.key}
              d={zone.path}
              className={'ncr-zone' + (selected === zone.key ? ' ncr-zone-active' : '')}
              fill={zone.hue}
              onClick={() => setSelected(zone.key)}
            />
          ))}
          {zoneData.map((zone) => {
            const centroid = {
              Delhi: [66, 76],
              Gurugram: [42, 142],
              Noida: [148, 86],
              Faridabad: [118, 156],
              Ghaziabad: [194, 118],
              'Greater Noida': [206, 172],
            }[zone.key];
            return (
              <g key={zone.key + '-label'} onClick={() => setSelected(zone.key)} className="ncr-label-group">
                <circle cx={centroid[0]} cy={centroid[1]} r="4" className="ncr-pin" />
                <text x={centroid[0] + 8} y={centroid[1] + 4} className="ncr-label">{zone.key}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <aside className="ncr-map-panel">
        <p className="eyebrow">Selected Zone</p>
        <h3>{active.key}</h3>
        <p className="muted">Live coverage intelligence for delivery planning and supplier matching.</p>
        <div className="timeline" style={{ marginTop: '10px' }}>
          <div className="timeline-step"><span>Coverage score</span><b>{active.score}%</b></div>
          <div className="timeline-step"><span>Active suppliers</span><b>{active.suppliers}</b></div>
          <div className="timeline-step"><span>Average rating</span><b>{active.avgRating}</b></div>
          <div className="timeline-step"><span>Avg dispatch</span><b>{active.avgDispatch ? active.avgDispatch + ' hrs' : 'N/A'}</b></div>
        </div>
      </aside>
    </div>
  );
}
