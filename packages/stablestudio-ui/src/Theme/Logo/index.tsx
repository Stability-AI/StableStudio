import { Next } from "./Next";

export function Logo(props: JSX.IntrinsicElements["img"]) {
  return <img src="/logo.png" alt="Logo" {...props} />;
}

Logo.Next = Next;
