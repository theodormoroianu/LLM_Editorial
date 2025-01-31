import { useState } from 'react'
import { RequestSolutionGradingType, RequestSolutionGrading, RequestSolutionGradingResponse } from './api'
import { Button, H3, HTMLSelect, Label, ProgressBar, TextArea } from '@blueprintjs/core'
import { MarkdownPreviewer } from './helpers'


function GenerateEditorials() {
  const [statement, setStatement] = useState("Please provide the problem statement...")
  const [solution, setSolution] = useState("Please provide the solution...")
  const [humanRequest, setHumanRequest] = useState('')
  const [editorial, setEditorial] = useState('Please provide an editorial...')
  const [solutionGrading, setSolutionGrading] = useState('Press "Grade Solution"...')
  const [generating, setGenerating] = useState(false)
  const [authToken, setAuthToken] = useState(window.localStorage.getItem('authToken') || '')
  const [model, setModel] = useState<"mistral" | "gemini">("mistral")

  const handleSubmit = async () => {
    const request: RequestSolutionGradingType = {
      statement,
      editorial,
      solutionToGrade: solution,
      humanRequest,
      authToken,
      model,
    }

    setSolutionGrading('Generating grading...')
    setGenerating(true)
    console.log("Sending request", request)
    const response: RequestSolutionGradingResponse = await RequestSolutionGrading(request).catch((error) => {
      return { grading: '' + error }
    })
    console.log("Received response", response)
    setSolutionGrading(response.grading)
    setGenerating(false)
  }

  return (
    <div style={{
      paddingLeft: "20px",
      display: "flex",
      flexDirection: "row",
      height: "100%"
    }}>

      <div style={{
        width: "50%",
        padding: "20px",
        overflowY: "scroll",
      }}>
        <H3>Intro</H3>
        <p>This form promps the model to grade a solution to an exam, given the statements which describe the exam's problems, and given an editorial with the solution and a clear breakdown of the grade.</p>
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
          3. Solution to grade
          <TextArea
            fill
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            style={{
              height: "100px",
              resize: "vertical"
            }}
          />
        </Label>

        <Label style={{ paddingTop: "20px" }}>
          4. Additional LLM Instructions
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
          5. Model
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
          6. Auth Token
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
          Grade Solution
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}>
        <H3>Solution Grading</H3>

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

        <MarkdownPreviewer markdown={solutionGrading} setMarkdown={setSolutionGrading} />
      </div>
    </div >
  )
}

export default GenerateEditorials