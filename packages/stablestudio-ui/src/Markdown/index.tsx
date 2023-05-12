/* eslint-disable react/no-children-prop */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ text, className }: Styleable & { text: string }) {
  return (
    <span className={classes("prose dark:prose-invert", className)}>
      <ReactMarkdown children={text} remarkPlugins={[remarkGfm]} />
    </span>
  );
}
