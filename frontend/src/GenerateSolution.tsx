import { useState } from 'react'
import { RequestSourceCodeType, RequestSourceCodeResponse, RequestSourceCode } from './api'
import { Button, Card, H3, HTMLSelect, Label, ProgressBar, TextArea } from '@blueprintjs/core'
import AceEditor from "react-ace"

import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";

function GenerateSourceCode() {
  const [statement, setStatement] = useState('')
  const [editorial, setEditorial] = useState('')
  const [humanRequest, setHumanRequest] = useState('')
  const [sourceCode, setSourceCode] = useState('Press submit to generate the source code...')
  const [generating, setGenerating] = useState(false)
  const [authToken, setAuthToken] = useState(window.localStorage.getItem('authToken') || '')
  const [model, setModel] = useState<"mistral" | "gemini">("mistral")

  const handleSubmit = async () => {
    const request: RequestSourceCodeType = {
      statement,
      editorial,
      authToken,
      humanRequest,
      model,
    }

    setSourceCode('Generating source code...')
    setGenerating(true)
    console.log("Sending request", request)
    const response: RequestSourceCodeResponse = await RequestSourceCode(request).catch((error) => {
      return { sourceCode: '' + error }
    })
    console.log("Received response", response)
    setSourceCode(response.sourceCode)
    setGenerating(false)
  }

  return (
    <div style={{
      paddingLeft: "20px",
      paddingRight: "20px",
      display: "flex",
      flexDirection: "row",
      height: "100%"
    }}>

      <div style={{
        width: "50%",
        padding: "20px",
        overflowY: "scroll",
      }}>
        <H3>Problem Details</H3>
        <Label>
          1. Problem Statement
          <TextArea
            value={statement}
            fill
            onChange={(e) => setStatement(e.target.value)}
            style={{
              height: "100px",
              resize: "vertical"
            }}
          />
        </Label>

        <Label style={{ paddingTop: "20px" }}>
          2. Editorial
          <TextArea
            value={editorial}
            fill
            onChange={(e) => setEditorial(e.target.value)}
            style={{
              height: "100px",
              resize: "vertical"
            }}
          />
        </Label>

        <Label style={{ paddingTop: "20px" }}>
          3. Additional LLM Instructions
          <TextArea
            value={humanRequest}
            fill
            onChange={(e) => setHumanRequest(e.target.value)}
            style={{
              height: "100px",
              resize: "vertical"
            }}
          />
        </Label>

        <Label style={{ paddingTop: "20px" }}>
          4. Model
          <HTMLSelect
            value={model}
            onChange={(e) => setModel(e.target.value as "mistral" | "gemini")}
            style={{ width: "100%" }}
          >
            <option value="mistral">Mistral</option>
            <option value="gemini">Gemini</option>
          </HTMLSelect>
        </Label>

        <Label style={{ paddingTop: "20px" }}>
          5. Auth Token
          <input
            type='text'
            value={authToken}
            onChange={(e) => {
              setAuthToken(e.target.value)
              window.localStorage.setItem('authToken', e.target.value)
            }}
            style={{ width: "100%" }}
          />
        </Label>

        <Button intent="primary" onClick={handleSubmit}>
          Generate Source Code
        </Button>
      </div>

      <div style={{
        border: "2px dashed",
        borderColor: "#ccc",
        height: "100%",
        position: "relative",
      }}></div>

      <div style={{
        width: "50%",
        padding: "20px",
        overflowY: "scroll",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}>
        <H3>Source Code</H3>

        <div style={{
          "position": "relative",
        }}>
          {generating && <div style={{
            position: "absolute",
            top: -7,
            left: 0,
            width: "100%",
          }}>
            <ProgressBar intent='primary' />
          </div>}
        </div>

        <Card style={{ "padding": "0", flex: "1" }}>
          <div style={{ height: "100%" }}>
            <AceEditor
              style={{ width: "100%", height: "100%" }}
              mode="c_cpp"
              theme="tomorrow"
              value={sourceCode}
              name="UNIQUE_ID_OF_DIV"
              editorProps={{ $blockScrolling: true }}
            />,
          </div>
        </Card>
      </div>
    </div >
  )
}

export default GenerateSourceCode