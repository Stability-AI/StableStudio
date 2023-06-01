import { Theme } from "~/Theme";

type Props = Theme.Icon.Props;

export function Instagram(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path d="M 8 3 C 5.239 3 3 5.239 3 8 L 3 16 C 3 18.761 5.239 21 8 21 L 16 21 C 18.761 21 21 18.761 21 16 L 21 8 C 21 5.239 18.761 3 16 3 L 8 3 z M 18 5 C 18.552 5 19 5.448 19 6 C 19 6.552 18.552 7 18 7 C 17.448 7 17 6.552 17 6 C 17 5.448 17.448 5 18 5 z M 12 7 C 14.761 7 17 9.239 17 12 C 17 14.761 14.761 17 12 17 C 9.239 17 7 14.761 7 12 C 7 9.239 9.239 7 12 7 z M 12 9 A 3 3 0 0 0 9 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 12 A 3 3 0 0 0 12 9 z" />
    </svg>
  ));
}

export function Twitter(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path d="M22,3.999c-0.78,0.463-2.345,1.094-3.265,1.276c-0.027,0.007-0.049,0.016-0.075,0.023c-0.813-0.802-1.927-1.299-3.16-1.299 c-2.485,0-4.5,2.015-4.5,4.5c0,0.131-0.011,0.372,0,0.5c-3.353,0-5.905-1.756-7.735-4c-0.199,0.5-0.286,1.29-0.286,2.032 c0,1.401,1.095,2.777,2.8,3.63c-0.314,0.081-0.66,0.139-1.02,0.139c-0.581,0-1.196-0.153-1.759-0.617c0,0.017,0,0.033,0,0.051 c0,1.958,2.078,3.291,3.926,3.662c-0.375,0.221-1.131,0.243-1.5,0.243c-0.26,0-1.18-0.119-1.426-0.165 c0.514,1.605,2.368,2.507,4.135,2.539c-1.382,1.084-2.341,1.486-5.171,1.486H2C3.788,19.145,6.065,20,8.347,20 C15.777,20,20,14.337,20,8.999c0-0.086-0.002-0.266-0.005-0.447C19.995,8.534,20,8.517,20,8.499c0-0.027-0.008-0.053-0.008-0.08 c-0.003-0.136-0.006-0.263-0.009-0.329c0.79-0.57,1.475-1.281,2.017-2.091c-0.725,0.322-1.503,0.538-2.32,0.636 C20.514,6.135,21.699,4.943,22,3.999z" />
    </svg>
  ));
}

export function Discord(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path d="M19.952,5.672c-1.904-1.531-4.916-1.79-5.044-1.801c-0.201-0.017-0.392,0.097-0.474,0.281 c-0.006,0.012-0.072,0.163-0.145,0.398c1.259,0.212,2.806,0.64,4.206,1.509c0.224,0.139,0.293,0.434,0.154,0.659 c-0.09,0.146-0.247,0.226-0.407,0.226c-0.086,0-0.173-0.023-0.252-0.072C15.584,5.38,12.578,5.305,12,5.305S8.415,5.38,6.011,6.872 c-0.225,0.14-0.519,0.07-0.659-0.154c-0.14-0.225-0.07-0.519,0.154-0.659c1.4-0.868,2.946-1.297,4.206-1.509 c-0.074-0.236-0.14-0.386-0.145-0.398C9.484,3.968,9.294,3.852,9.092,3.872c-0.127,0.01-3.139,0.269-5.069,1.822 C3.015,6.625,1,12.073,1,16.783c0,0.083,0.022,0.165,0.063,0.237c1.391,2.443,5.185,3.083,6.05,3.111c0.005,0,0.01,0,0.015,0 c0.153,0,0.297-0.073,0.387-0.197l0.875-1.202c-2.359-0.61-3.564-1.645-3.634-1.706c-0.198-0.175-0.217-0.477-0.042-0.675 c0.175-0.198,0.476-0.217,0.674-0.043c0.029,0.026,2.248,1.909,6.612,1.909c4.372,0,6.591-1.891,6.613-1.91 c0.198-0.172,0.5-0.154,0.674,0.045c0.174,0.198,0.155,0.499-0.042,0.673c-0.07,0.062-1.275,1.096-3.634,1.706l0.875,1.202 c0.09,0.124,0.234,0.197,0.387,0.197c0.005,0,0.01,0,0.015,0c0.865-0.027,4.659-0.667,6.05-3.111 C22.978,16.947,23,16.866,23,16.783C23,12.073,20.985,6.625,19.952,5.672z M8.891,14.87c-0.924,0-1.674-0.857-1.674-1.913 s0.749-1.913,1.674-1.913s1.674,0.857,1.674,1.913S9.816,14.87,8.891,14.87z M15.109,14.87c-0.924,0-1.674-0.857-1.674-1.913 s0.749-1.913,1.674-1.913c0.924,0,1.674,0.857,1.674,1.913S16.033,14.87,15.109,14.87z" />
    </svg>
  ));
}

export function CGSociety(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 225.000000 225.000000"
      width={width}
      height={height}
      {...props}
    >
      <g
        transform="translate(0.000000,225.000000) scale(0.100000,-0.100000)"
        fill="none"
        stroke="none"
      >
        <path
          fill={color}
          d="M0 1125 l0 -1125 1125 0 1125 0 0 1125 0 1125 -1125 0 -1125 0 0 -1125z m994 316 c61 -30 85 -78 86 -168 l0 -63 -105 0 -105 0 0 25 c0 15 -10 31 -26 42 -23 14 -53 17 -198 18 -196 0 -217 -6 -235 -72 -14 -51 -13 -209 2 -253 18 -53 57 -62 260 -58 163 3 169 4 188 27 10 13 19 36 19 52 l0 30 108 -3 107 -3 -2 -78 c-2 -97 -21 -133 -85 -165 -61 -31 -248 -43 -496 -32 -162 7 -188 11 -230 32 -28 14 -54 36 -66 56 -32 56 -42 308 -20 490 4 28 16 55 35 77 56 63 125 74 464 72 242 -2 252 -3 299 -26z m940 14 c121 -21 159 -60 172 -172 l7 -63 -102 0 c-55 0 -104 -1 -108 -2 -5 -2 -9 9 -11 25 -5 45 -30 51 -237 51 -214 1 -247 -6 -264 -56 -14 -41 -14 -236 0 -277 6 -17 19 -36 29 -41 11 -6 112 -10 231 -10 238 0 249 3 249 67 l0 33 -145 0 -145 0 0 70 0 70 250 0 250 0 -1 -92 c-2 -198 -18 -244 -101 -286 -41 -20 -69 -24 -215 -32 -92 -4 -239 -4 -326 0 -235 12 -276 38 -298 196 -13 93 -6 343 12 394 41 119 100 137 464 138 141 1 236 -3 289 -13z"
        />
      </g>
    </svg>
  ));
}

export function ArtStation(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={width}
      height={height}
      {...props}
    >
      <path
        fill={color}
        d="M2.141 34l3.771 6.519.001.001C6.656 41.991 8.18 43 9.94 43l.003 0 0 0h25.03l-5.194-9H2.141zM45.859 34.341c0-.872-.257-1.683-.697-2.364L30.977 7.319C30.245 5.94 28.794 5 27.124 5h-7.496l21.91 37.962 3.454-5.982C45.673 35.835 45.859 35.328 45.859 34.341zM25.838 28L16.045 11.038 6.252 28z"
      />
    </svg>
  ));
}

export function InfoIcon({ width, height, color, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </svg>
  );
}

export function ShareIcon(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
  ));
}

export function AspectRatio(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
      <path d="M2 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H3v2.5a.5.5 0 0 1-1 0v-3zm12 7a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H13V8.5a.5.5 0 0 1 1 0v3z" />
    </svg>
  ));
}

export function ModelIcon(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z" />
      <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z" />
    </svg>
  ));
}

export function SlidersIcon(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M10.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4H1.5a.5.5 0 0 1 0-1H10V1.5a.5.5 0 0 1 .5-.5ZM12 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Zm-6.5 2A.5.5 0 0 1 6 6v1.5h8.5a.5.5 0 0 1 0 1H6V10a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5ZM1 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 1 8Zm9.5 2a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V13H1.5a.5.5 0 0 1 0-1H10v-1.5a.5.5 0 0 1 .5-.5Zm1.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Z"
      />
    </svg>
  ));
}

export function SeedIcon(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <path d="M512 64c0 113.6-84.6 207.5-194.2 222c-7.1-53.4-30.6-101.6-65.3-139.3C290.8 78.3 364 32 448 32h32c17.7 0 32 14.3 32 32zM0 128c0-17.7 14.3-32 32-32H64c123.7 0 224 100.3 224 224v32 96c0 17.7-14.3 32-32 32s-32-14.3-32-32V352C100.3 352 0 251.7 0 128z" />
    </svg>
  ));
}

export function Scale(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="6 6 20 20"
      width={width}
      height={height}
      fill={color}
      {...props}
    >
      <rect x="9" y="9" width="3" height="3" fill={color} />
      <rect opacity="0.6" x="20" y="9" width="3" height="3" fill={color} />
      <rect opacity="0.8" x="14.5" y="9" width="3" height="3" fill={color} />
      <rect opacity="0.8" x="9" y="14.5" width="3" height="3" fill={color} />
      <rect opacity="0.4" x="20" y="14.5" width="3" height="3" fill={color} />
      <rect opacity="0.6" x="14.5" y="14.5" width="3" height="3" fill={color} />
      <rect opacity="0.6" x="9" y="20" width="3" height="3" fill={color} />
      <rect opacity="0.2" x="20" y="20" width="3" height="3" fill={color} />
      <rect opacity="0.4" x="14.5" y="20" width="3" height="3" fill={color} />
    </svg>
  ));
}

export function Steps(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="6 6 20 20"
      fill="none"
      width={width}
      height={height}
      {...props}
    >
      <g clipPath="url(#clip0_214_14526)">
        <path
          d="M9 23.9999V18.9999H14V13.9999L19 13.9997V8.99988H24"
          stroke={color}
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_214_14526">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(8 8)"
          />
        </clipPath>
      </defs>
    </svg>
  ));
}

export function Rectangle(props: Props) {
  return defaults(props)(({ width, height, color = "#3F3F46", ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      width={width}
      height={height}
      {...props}
    >
      <path
        d="M3.33333 19L20.6667 19C21.403 19 22 18.3036 22 17.4444L22 6.55556C22 5.69645 21.403 5 20.6667 5L3.33333 5C2.59695 5 2 5.69645 2 6.55556L2 17.4444C2 18.3036 2.59695 19 3.33333 19Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="19"
        y="16"
        width="14"
        height="8"
        transform="rotate(180 19 16)"
        stroke={color}
        strokeLinejoin="round"
      />
      <rect
        x="16"
        y="16"
        width="8"
        height="8"
        transform="rotate(180 16 16)"
        fill={color}
      />
      <rect
        x="17"
        y="17"
        width="10"
        height="10"
        transform="rotate(180 17 17)"
        fill="#18181B"
      />
      <rect
        x="20"
        y="14"
        width="16"
        height="4"
        transform="rotate(180 20 14)"
        fill="#18181B"
      />
    </svg>
  ));
}

export function Generate(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 10"
      width={width}
      height={height}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0.5C0 0.223858 0.223858 0 0.5 0H3.5C3.77614 0 4 0.223858 4 0.5V3.5C4 3.77614 3.77614 4 3.5 4H0.5C0.223858 4 0 3.77614 0 3.5V0.5ZM1 1V3H3V1H1ZM5 0.5C5 0.223858 5.22386 0 5.5 0H8.5C8.77614 0 9 0.223858 9 0.5V3.5C9 3.77614 8.77614 4 8.5 4H5.5C5.22386 4 5 3.77614 5 3.5V0.5ZM6 1V3H8V1H6ZM10.5 0C10.2239 0 10 0.223858 10 0.5V3.5C10 3.77614 10.2239 4 10.5 4H13.5C13.7761 4 14 3.77614 14 3.5V0.5C14 0.223858 13.7761 0 13.5 0H10.5ZM11 3V1H13V3H11ZM0 6.5C0 6.22386 0.223858 6 0.5 6H3.5C3.77614 6 4 6.22386 4 6.5V9.5C4 9.77614 3.77614 10 3.5 10H0.5C0.223858 10 0 9.77614 0 9.5V6.5ZM1 7V9H3V7H1ZM5.5 6C5.22386 6 5 6.22386 5 6.5V9.5C5 9.77614 5.22386 10 5.5 10H8.5C8.77614 10 9 9.77614 9 9.5V6.5C9 6.22386 8.77614 6 8.5 6H5.5ZM6 9V7H8V9H6Z"
        fill={color}
      />
    </svg>
  ));
}

export function Variation(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.67183 13.5269L3.67184 11.1072C3.67184 10.0026 4.56727 9.10722 5.67184 9.10722L9.86719 9.10722C10.9718 9.10722 11.8672 8.21179 11.8672 7.10722L11.8672 2.25825"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.3262 3.94141L11.9116 1.52683L9.49701 3.94141"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.67188 13.5269L3.67188 4.30708"
        stroke={color}
        strokeLinecap="round"
      />
    </svg>
  ));
}

export function Dream(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16.493 15.2672L17.0352 15.7854C17.2547 15.5558 17.3057 15.2127 17.1625 14.9292C17.0193 14.6456 16.713 14.483 16.3978 14.5233L16.493 15.2672ZM8.45711 10.5889L7.74713 10.8306L8.45711 10.5889ZM10.839 2.77376L11.3209 3.34843C11.5636 3.1449 11.6523 2.81085 11.5425 2.51375C11.4327 2.21665 11.1481 2.02056 10.8314 2.0238L10.839 2.77376ZM16.3978 14.5233C13.1713 14.9362 10.1445 13.2178 9.16709 10.3472L7.74713 10.8306C8.98441 14.4646 12.7513 16.5022 16.5882 16.0112L16.3978 14.5233ZM9.16709 10.3472C8.31741 7.85159 9.22305 5.10774 11.3209 3.34843L10.3571 2.19909C7.84641 4.30457 6.6731 7.67608 7.74713 10.8306L9.16709 10.3472ZM8.92273 3.78798C9.56847 3.61558 10.2143 3.53017 10.8467 3.52372L10.8314 2.0238C10.0741 2.03153 9.30342 2.13381 8.53581 2.33875L8.92273 3.78798ZM3.65923 12.1797C2.70919 8.62126 5.00941 4.83278 8.92273 3.78798L8.53581 2.33875C3.91162 3.57333 1.02312 8.12111 2.21 12.5666L3.65923 12.1797ZM12.405 16.8311C8.49171 17.8759 4.60927 15.7381 3.65923 12.1797L2.21 12.5666C3.39687 17.0121 8.16777 19.5149 12.792 18.2804L12.405 16.8311ZM15.9509 14.7491C15.0314 15.7111 13.8217 16.4529 12.405 16.8311L12.792 18.2804C14.4774 17.8304 15.9276 16.9444 17.0352 15.7854L15.9509 14.7491Z"
        fill={color}
      />
      <path
        d="M15.0371 7.24414V9.65901"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.2449 8.45166H13.8301"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.6055 3V4.20744"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.2074 3.60352H18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ));
}

export function Upscale(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth="0.9"
      {...props}
    >
      <path
        d="M14 2L6 10"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 2H2V14H14V8"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.667 2H14.0003V5.33333"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33333 9.99996H6V6.66663"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ));
}

export function Light(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color}
      {...props}
    >
      <path d="M8 12.25A4.25 4.25 0 0 1 12.25 8v0a4.25 4.25 0 0 1 4.25 4.25v0a4.25 4.25 0 0 1-4.25 4.25v0A4.25 4.25 0 0 1 8 12.25v0Z" />
      <path
        d="M12.25 3v1.5M21.5 12.25H20M18.791 18.791l-1.06-1.06M18.791 5.709l-1.06 1.06M12.25 20v1.5M4.5 12.25H3M6.77 6.77 5.709 5.709M6.77 17.73l-1.061 1.061"
        fill="none"
      />
    </svg>
  ));
}

export function Dark(props: Props) {
  return defaults(props)(({ width, height, color, ...props }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color}
      {...props}
    >
      <path
        d="M17.25 16.22a6.937 6.937 0 0 1-9.47-9.47 7.451 7.451 0 1 0 9.47 9.47ZM12.75 7C17 7 17 2.75 17 2.75S17 7 21.25 7C17 7 17 11.25 17 11.25S17 7 12.75 7Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ));
}

const defaults =
  (props: Props) =>
  (render: (props: Props) => JSX.Element): JSX.Element =>
    render({
      ...props,
      color: props.color ?? "currentColor",
    });
