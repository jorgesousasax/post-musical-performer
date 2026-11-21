
import React, { useState } from 'react';

const initialAxes = [
  { id: 1, name: 'Mediality', low: 'Acoustic sound', high: 'Multimedia', value: 75 },
  { id: 2, name: 'Agency', low: 'Reproduction', high: 'Co-creation', value: 65 },
  { id: 3, name: 'Performer role', low: 'Interpreter', high: 'Material source', value: 55 },
  { id: 4, name: 'Temporal involvement', low: 'Live event', high: 'Post-analysis', value: 70 },
  { id: 5, name: 'Work', low: 'Fixed work', high: 'Open experimentation', value: 80 },
  { id: 6, name: 'Hybridisation', low: 'Instrumental', high: 'Digital / physical', value: 60 },
];

function App() {
  const [axes, setAxes] = useState(initialAxes);
  const [title, setTitle] = useState('Post-Musical Performer');
  const [profileName, setProfileName] = useState('My performance');
  const [color, setColor] = useState('#5689A6');

  const cx = 300;
  const cy = 285;
  const radius = 175;

  const point = (index, value) => {
    const angle = (Math.PI * 2 * index / axes.length) - Math.PI / 2;
    const distance = radius * value / 100;
    return [
      cx + Math.cos(angle) * distance,
      cy + Math.sin(angle) * distance,
    ];
  };

  const polygon = (values) =>
    values.map((value, index) => point(index, value).join(',')).join(' ');

  const updateAxis = (id, field, value) => {
    setAxes(current => current.map(axis =>
      axis.id === id ? { ...axis, [field]: value } : axis
    ));
  };

  const addAxis = () => {
    const id = Math.max(0, ...axes.map(a => a.id)) + 1;
    setAxes([...axes, {
      id,
      name: `New axis ${axes.length + 1}`,
      low: 'Low pole',
      high: 'High pole',
      value: 50,
    }]);
  };

  const removeAxis = (id) => {
    if (axes.length <= 3) return;
    setAxes(axes.filter(axis => axis.id !== id));
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f4f3ef',
      color: '#252b30',
      fontFamily: 'Arial, sans-serif',
      padding: '30px 20px'
    }}>
      <div style={{ maxWidth: 1150, margin: 'auto' }}>
        <header style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: '#75828a' }}>
            PERFORMANCE RESEARCH TOOL
          </div>
          <h1 style={{ fontSize: 30, margin: '9px 0' }}>
            Diagram Builder
          </h1>
          <p style={{ color: '#6d777d', margin: 0 }}>
            Create, configure and explore performative diagrams.
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          alignItems: 'start'
        }}>
          <section style={{
            background: '#fff',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 3px 16px #0000000a'
          }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', border: 0, fontSize: 22,
                fontWeight: 600, marginBottom: 8,
                color: '#28343b', outline: 'none'
              }}
            />
            <input
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              aria-label="Profile name"
              style={{
                width: '100%', border: 0, fontSize: 13,
                color: '#75828a', outline: 'none'
              }}
            />

            <svg viewBox="0 0 600 570" width="100%" role="img"
              aria-label="Editable radial performance diagram">
              {[25, 50, 75, 100].map(level => (
                <polygon
                  key={level}
                  points={polygon(axes.map(() => level))}
                  fill="none"
                  stroke="#dce1e2"
                  strokeWidth="1"
                />
              ))}

              {axes.map((axis, index) => {
                const [x, y] = point(index, 100);
                const [lx, ly] = point(index, 117);
                const anchor = lx < cx - 15 ? 'end' : lx > cx + 15 ? 'start' : 'middle';
                return (
                  <g key={axis.id}>
                    <line x1={cx} y1={cy} x2={x} y2={y}
                      stroke="#b9c2c5" strokeWidth="1"/>
                    <text x={lx} y={ly} textAnchor={anchor}
                      dominantBaseline="middle" fontSize="13"
                      fill="#34444d" fontWeight="600">
                      {axis.name}
                    </text>
                  </g>
                );
              })}

              <polygon
                points={polygon(axes.map(a => a.value))}
                fill={color}
                fillOpacity="0.32"
                stroke={color}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {axes.map((axis, index) => {
                const [x, y] = point(index, axis.value);
                return <circle key={axis.id} cx={x} cy={y} r="5"
                  fill={color} stroke="#fff" strokeWidth="2"/>;
              })}

              <circle cx={cx} cy={cy} r="4" fill="#34444d"/>
              <text x={cx} y={cy + 20} textAnchor="middle"
                fontSize="11" fill="#52616a">
                PERFORMANCE
              </text>
            </svg>

            <div style={{ textAlign: 'center', color: '#7c878c', fontSize: 12 }}>
              {profileName}
            </div>
          </section>

          <section style={{
            background: '#fff',
            borderRadius: 16,
            padding: 22,
            boxShadow: '0 3px 16px #0000000a'
          }}>
            <h2 style={{ fontSize: 19, marginTop: 0 }}>Diagram settings</h2>

            <label style={{ display: 'block', fontSize: 13, marginBottom: 7 }}>
              Profile colour
            </label>
            <input type="color" value={color}
              onChange={e => setColor(e.target.value)}
              style={{ width: 55, height: 35, marginBottom: 18 }}/>

            <h3 style={{ fontSize: 15 }}>Axes ({axes.length})</h3>

            {axes.map((axis, index) => (
              <div key={axis.id} style={{
                borderTop: '1px solid #e9ecec',
                padding: '15px 0'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 10
                }}>
                  <strong style={{ fontSize: 14 }}>
                    {index + 1}. {axis.name}
                  </strong>
                  <button onClick={() => removeAxis(axis.id)}
                    style={{
                      border: 0, background: '#f5eeee',
                      color: '#a14c4c', borderRadius: 6,
                      padding: '5px 9px', cursor: 'pointer'
                    }}>
                    Remove
                  </button>
                </div>

                <input value={axis.name}
                  onChange={e => updateAxis(axis.id, 'name', e.target.value)}
                  placeholder="Axis name"
                  style={fieldStyle}/>

                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 8, marginTop: 8
                }}>
                  <input value={axis.low}
                    onChange={e => updateAxis(axis.id, 'low', e.target.value)}
                    placeholder="Low pole" style={fieldStyle}/>
                  <input value={axis.high}
                    onChange={e => updateAxis(axis.id, 'high', e.target.value)}
                    placeholder="High pole" style={fieldStyle}/>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: '#65747b', marginTop: 12
                }}>
                  <span>{axis.low}</span>
                  <strong>{axis.value}/100</strong>
                  <span>{axis.high}</span>
                </div>

                <input type="range" min="0" max="100"
                  value={axis.value}
                  onChange={e => updateAxis(axis.id, 'value', Number(e.target.value))}
                  style={{ width: '100%', accentColor: color }}/>
              </div>
            ))}

            <button onClick={addAxis} style={{
              width: '100%', padding: 12, border: '1px solid #aebdc3',
              background: '#f7f9f9', borderRadius: 8,
              cursor: 'pointer', fontWeight: 600, marginTop: 8
            }}>
              + Add axis
            </button>
          </section>
        </div>

        <footer style={{
          textAlign: 'center', color: '#899398',
          fontSize: 12, marginTop: 30
        }}>
          Post-Musical Performer · Diagram Builder · Early prototype
        </footer>
      </div>
    </main>
  );
}

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px',
  border: '1px solid #dce2e4',
  borderRadius: 6,
  fontSize: 12,
  color: '#35434a',
};

export default App;
