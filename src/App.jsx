
import React, { useRef, useState } from 'react';

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
  const [profileName, setProfileName] = useState('My perspective');
  const [centerLabel, setCenterLabel] = useState('Subject of analysis');
  const [color, setColor] = useState('#5689A6');
  const [message, setMessage] = useState('');

  const fileInputRef = useRef(null);
  const svgRef = useRef(null);
  const draggingAxisId = useRef(null);

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

  // Creates a continuous, smooth curve through the data points.
  const smoothPath = (values) => {
    const points = values.map((value, index) => point(index, value));
    const count = points.length;

    if (count < 3) return '';

    const tension = 0.8;
    let path = `M ${points[0][0]} ${points[0][1]}`;

    for (let i = 0; i < count; i++) {
      const previous = points[(i - 1 + count) % count];
      const current = points[i];
      const next = points[(i + 1) % count];
      const afterNext = points[(i + 2) % count];

      const cp1x = current[0] + (next[0] - previous[0]) * tension / 6;
      const cp1y = current[1] + (next[1] - previous[1]) * tension / 6;
      const cp2x = next[0] - (afterNext[0] - current[0]) * tension / 6;
      const cp2y = next[1] - (afterNext[1] - current[1]) * tension / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next[0]} ${next[1]}`;
    }

    return path + ' Z';
  };

  const updateAxis = (id, field, value) => {
    setAxes(current => current.map(axis =>
      axis.id === id ? { ...axis, [field]: value } : axis
    ));
    setMessage('');
  };

  const startDragging = (event, axisId) => {
    event.preventDefault();
    draggingAxisId.current = axisId;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may not be available in every browser.
    }
  };

  const handlePointerMove = (event) => {
    if (draggingAxisId.current === null || !svgRef.current) return;

    const svg = svgRef.current;
    const matrix = svg.getScreenCTM();

    if (!matrix) return;

    const screenPoint = svg.createSVGPoint();
    screenPoint.x = event.clientX;
    screenPoint.y = event.clientY;

    const svgPoint = screenPoint.matrixTransform(matrix.inverse());

    const dx = svgPoint.x - cx;
    const dy = svgPoint.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const value = Math.max(
      0,
      Math.min(100, Math.round(distance / radius * 100))
    );

    const id = draggingAxisId.current;

    setAxes(current => current.map(axis =>
      axis.id === id ? { ...axis, value } : axis
    ));

    setMessage('');
  };

  const stopDragging = () => {
    draggingAxisId.current = null;
  };

  const addAxis = () => {
    const id = Math.max(0, ...axes.map(a => a.id)) + 1;

    setAxes(current => [...current, {
      id,
      name: `New axis ${current.length + 1}`,
      low: 'Low pole',
      high: 'High pole',
      value: 50,
    }]);

    setMessage('');
  };

  const removeAxis = (id) => {
    if (axes.length <= 3) return;

    setAxes(current => current.filter(axis => axis.id !== id));
    setMessage('');
  };

  const saveDiagram = () => {
    const diagram = {
      format: 'Post-Musical Performer Diagram',
      version: 3,
      title,
      profileName,
      centerLabel,
      color,
      axes,
    };

    const file = new Blob(
      [JSON.stringify(diagram, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${(profileName || 'my-diagram')
      .trim()
      .replace(/[^a-z0-9-_]/gi, '-')}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage('Diagram saved to your computer.');
  };

  const openDiagram = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const diagram = JSON.parse(content);

      if (
        !Array.isArray(diagram.axes) ||
        diagram.axes.length < 3 ||
        !diagram.axes.every(axis =>
          typeof axis.name === 'string' &&
          typeof axis.low === 'string' &&
          typeof axis.high === 'string' &&
          Number.isFinite(Number(axis.value))
        )
      ) {
        throw new Error('Invalid diagram');
      }

      setAxes(diagram.axes.map((axis, index) => ({
        ...axis,
        id: axis.id ?? index + 1,
        value: Math.max(0, Math.min(100, Number(axis.value))),
      })));

      setTitle(
        typeof diagram.title === 'string'
          ? diagram.title
          : 'Post-Musical Performer'
      );

      setProfileName(
        typeof diagram.profileName === 'string'
          ? diagram.profileName
          : 'My perspective'
      );

      setCenterLabel(
        typeof diagram.centerLabel === 'string'
          ? diagram.centerLabel
          : 'Subject of analysis'
      );

      setColor(
        /^#[0-9a-f]{6}$/i.test(diagram.color)
          ? diagram.color
          : '#5689A6'
      );

      setMessage('Diagram opened successfully.');
    } catch {
      setMessage(
        'Could not open this file. Please select a valid diagram JSON file.'
      );
    }

    event.target.value = '';
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
          <div style={{
            fontSize: 12,
            letterSpacing: 3,
            color: '#75828a'
          }}>
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
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 20
        }}>
          <button onClick={saveDiagram} style={actionButton}>
            ↓ Save diagram
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={actionButton}
          >
            ↑ Open diagram
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={openDiagram}
            style={{ display: 'none' }}
          />
        </div>

        {message && (
          <p role="status" style={{
            color: '#526b58',
            fontSize: 13,
            margin: '0 0 16px'
          }}>
            {message}
          </p>
        )}

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

            <label style={labelStyle}>
              Diagram title
            </label>

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              aria-label="Diagram title"
              placeholder="Enter diagram title"
              style={titleInputStyle}
            />

            <label style={labelStyle}>
              Profile / Perspective
            </label>

            <input
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              aria-label="Profile or perspective"
              placeholder="e.g. My composition, My performance..."
              style={fieldStyle}
            />

            <label style={labelStyle}>
              Subject of analysis (centre of diagram)
            </label>

            <input
              value={centerLabel}
              onChange={e => setCenterLabel(e.target.value)}
              aria-label="Subject of analysis"
              placeholder="e.g. Composition, Performance, Musical work..."
              style={fieldStyle}
            />

            <svg
              ref={svgRef}
              viewBox="0 0 600 570"
              width="100%"
              role="img"
              aria-label="Radial performance diagram. Drag the points to change their values."
              style={{ touchAction: 'none', overflow: 'visible' }}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
            >
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

                const anchor = lx < cx - 15
                  ? 'end'
                  : lx > cx + 15
                    ? 'start'
                    : 'middle';

                return (
                  <g key={axis.id}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke="#b9c2c5"
                      strokeWidth="1"
                    />

                    <text
                      x={lx}
                      y={ly}
                      textAnchor={anchor}
                      dominantBaseline="middle"
                      fontSize="13"
                      fill="#34444d"
                      fontWeight="600"
                    >
                      {axis.name}
                    </text>
                  </g>
                );
              })}

              <path
                d={smoothPath(axes.map(a => a.value))}
                fill={color}
                fillOpacity="0.32"
                stroke={color}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {axes.map((axis, index) => {
                const [x, y] = point(index, axis.value);

                return (
                  <circle
                    key={axis.id}
                    cx={x}
                    cy={y}
                    r="7"
                    fill={color}
                    stroke="#fff"
                    strokeWidth="2"
                    style={{ cursor: 'grab', touchAction: 'none' }}
                    onPointerDown={event => startDragging(event, axis.id)}
                    aria-label={`Move ${axis.name} point`}
                  />
                );
              })}

              <circle cx={cx} cy={cy} r="4" fill="#34444d" />

              <text
                x={cx}
                y={cy + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#52616a"
              >
                {centerLabel}
              </text>
            </svg>

            <div style={{
              textAlign: 'center',
              color: '#7c878c',
              fontSize: 12
            }}>
              {profileName}
            </div>

            <p style={{
              textAlign: 'center',
              color: '#899398',
              fontSize: 11,
              marginBottom: 0
            }}>
              Drag the points to adjust the diagram directly.
            </p>
          </section>

          <section style={{
            background: '#fff',
            borderRadius: 16,
            padding: 22,
            boxShadow: '0 3px 16px #0000000a'
          }}>
            <h2 style={{ fontSize: 19, marginTop: 0 }}>
              Diagram settings
            </h2>

            <label style={labelStyle}>
              Profile colour
            </label>

            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              style={{
                width: 55,
                height: 35,
                marginBottom: 18
              }}
            />

            <h3 style={{ fontSize: 15 }}>
              Axes ({axes.length})
            </h3>

            {axes.map((axis, index) => (
              <div
                key={axis.id}
                style={{
                  borderTop: '1px solid #e9ecec',
                  padding: '15px 0'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10
                }}>
                  <strong style={{ fontSize: 14 }}>
                    {index + 1}. {axis.name}
                  </strong>

                  <button
                    onClick={() => removeAxis(axis.id)}
                    disabled={axes.length <= 3}
                    style={{
                      border: 0,
                      background: '#f5eeee',
                      color: '#a14c4c',
                      borderRadius: 6,
                      padding: '5px 9px',
                      cursor: axes.length <= 3
                        ? 'not-allowed'
                        : 'pointer',
                      opacity: axes.length <= 3 ? 0.4 : 1
                    }}
                  >
                    Remove
                  </button>
                </div>

                <input
                  value={axis.name}
                  onChange={e => updateAxis(
                    axis.id,
                    'name',
                    e.target.value
                  )}
                  placeholder="Axis name"
                  style={fieldStyle}
                />

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginTop: 8
                }}>
                  <input
                    value={axis.low}
                    onChange={e => updateAxis(
                      axis.id,
                      'low',
                      e.target.value
                    )}
                    placeholder="Low pole"
                    style={fieldStyle}
                  />

                  <input
                    value={axis.high}
                    onChange={e => updateAxis(
                      axis.id,
                      'high',
                      e.target.value
                    )}
                    placeholder="High pole"
                    style={fieldStyle}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: '#65747b',
                  marginTop: 12
                }}>
                  <span>{axis.low}</span>
                  <strong>{axis.value}/100</strong>
                  <span>{axis.high}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={axis.value}
                  onChange={e => updateAxis(
                    axis.id,
                    'value',
                    Number(e.target.value)
                  )}
                  style={{
                    width: '100%',
                    accentColor: color
                  }}
                />
              </div>
            ))}

            <button onClick={addAxis} style={{
              width: '100%',
              padding: 12,
              border: '1px solid #aebdc3',
              background: '#f7f9f9',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              marginTop: 8
            }}>
              + Add axis
            </button>
          </section>
        </div>

        <footer style={{
          textAlign: 'center',
          color: '#899398',
          fontSize: 12,
          marginTop: 30
        }}>
          Post-Musical Performer · Diagram Builder · Early prototype
        </footer>
      </div>
    </main>
  );
}

const actionButton = {
  padding: '11px 17px',
  border: '1px solid #aebdc3',
  background: '#fff',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
  color: '#35434a'
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#65747b',
  marginTop: 13,
  marginBottom: 6
};

const titleInputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #dce2e4',
  borderRadius: 6,
  padding: 10,
  fontSize: 20,
  fontWeight: 600,
  color: '#28343b',
  outline: 'none'
};

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
