export type Matrix = number[][];

const identity: Matrix = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

function multiply(a: Matrix, b: Matrix): Matrix {
  if (a.length !== 4 || b.length !== 4) {
    throw new Error("Matrices must be 4x4");
  }

  const c: Matrix = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      for (let k = 0; k < 4; k++) {
        c[row][col] += a[row][k] * b[k][col];
      }
    }
  }

  return c;
}

function projection_fov(
  fov_y: number,
  aspect: number,
  near: number,
  far: number
): Matrix {
  const min_x = -1,
    min_y = -1;
  const max_x = 1,
    max_y = 1;
  const h1 = (max_y + min_y) / (max_y - min_y);
  const w1 = (max_x + min_x) / (max_x - min_x);
  const t = Math.tan(fov_y / 2);
  const s1 = 1 / t;
  const s2 = 1 / (t * aspect);

  // map z to the range [0, 1]
  const f1 = far / (far - near);
  const f2 = -(far * near) / (far - near);

  return [
    [s1, 0, w1, 0],
    [0, s2, h1, 0],
    [0, 0, f1, f2],
    [0, 0, 1, 0],
  ];
}

function rotation_euler(x: number, y: number, z: number): Matrix {
  const a = Math.cos(x),
    b = Math.sin(x);
  const c = Math.cos(y),
    d = Math.sin(y);
  const e = Math.cos(z),
    f = Math.sin(z);

  const ae = a * e;
  const af = a * f;
  const be = b * e;
  const bf = b * f;

  return [
    [c * e, af + be * d, bf - ae * d, 0],
    [-c * f, ae - bf * d, be + af * d, 0],
    [d, -b * c, a * c, 0],
    [0, 0, 0, 1],
  ];
}

function scale(sx: number, sy: number, sz: number): Matrix {
  return [
    [sx, 0, 0, 0],
    [0, sy, 0, 0],
    [0, 0, sz, 0],
    [0, 0, 0, 1],
  ];
}

function translation(tx: number, ty: number, tz: number): Matrix {
  return [
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, tz],
    [0, 0, 0, 1],
  ];
}
