import MDEditor from '@uiw/react-md-editor';

import '@uiw/react-md-editor/markdown-editor.css';

interface MarkdownPreviewerProps {
  markdown: string
  setMarkdown: React.Dispatch<React.SetStateAction<string>>
}

export const MarkdownPreviewer = ({ markdown, setMarkdown }: MarkdownPreviewerProps) => {
  return <div className="container" data-color-mode="light" style={{
    padding: "0px",
    flex: "1 1 auto",
    overflowY: "scroll",
    border: "1px solid #ccc",
  }}>
    <MDEditor
      value={markdown}
      onChange={value => setMarkdown(value || '')}
      preview="preview"
      height="100%"
    />
  </div>
}
