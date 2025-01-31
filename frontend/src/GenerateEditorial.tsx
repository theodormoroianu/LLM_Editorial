import { useState } from 'react'
import { RequestEditorialType, RequestEditorialResponse, RequestEditorial } from './api'
import { Button, H3, HTMLSelect, Label, ProgressBar, TextArea } from '@blueprintjs/core'
import { MarkdownPreviewer } from './helpers'


function GenerateEditorials() {
  const [statement, setStatement] = useState('')
  const [solutions, setSolutions] = useState<string[]>([])
  const [humanRequest, setHumanRequest] = useState('')
  const [editorial, setEditorial] = useState('Press submit to generate the editorial...')
  const [generating, setGenerating] = useState(false)
  const [authToken, setAuthToken] = useState(window.localStorage.getItem('authToken') || '')
  const [model, setModel] = useState<"mistral" | "gemini">("mistral")
  const [stepByStep, setStepByStep] = useState("false")

  const handleAddSolution = () => {
    setSolutions([...solutions, ''])
  }

  const handleSolutionChange = (index: number, value: string) => {
    const newSolutions = [...solutions]
    newSolutions[index] = value
    setSolutions(newSolutions)
  }

  const handleSubmit = async () => {
    const request: RequestEditorialType = {
      statement,
      solutions,
      humanRequest,
      authToken,
      model,
      stepByStep: stepByStep === "true",
    }

    setEditorial('Generating editorial...')
    setGenerating(true)
    console.log("Sending request", request)
    const response: RequestEditorialResponse = await RequestEditorial(request).catch((error) => {
      return { editorial: '' + error }
    })
    console.log("Received response", response)
    setEditorial(response.editorial)
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

        <Label>
          2. Available Correct Solutions
          {solutions.map((solution, index) => (
            <TextArea
              key={index}
              fill
              value={solution}
              onChange={(e) => handleSolutionChange(index, e.target.value)}
              style={{
                height: "100px",
                resize: "vertical"
              }}
            />
          ))}
        </Label>

        <div style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "-10px",
        }}>
          <Button icon="add" onClick={handleAddSolution} style={{ marginRight: "10px" }}>
            Add a Solution
          </Button>
          <Button icon="delete" onClick={() => setSolutions(solutions.slice(0, -1))} disabled={solutions.length === 0}>
            Delete Last Solution
          </Button>
        </div>

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
          4. Step by Step Editorial
          <HTMLSelect
            value={stepByStep}
            onChange={(e) => setStepByStep(e.target.value === "true" ? "true" : "false")}
            style={{ width: "100%" }}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </HTMLSelect>
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
          Generate Editorial
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
        <H3>Editorial</H3>

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

        <MarkdownPreviewer markdown={editorial} setMarkdown={setEditorial} />
      </div>
    </div >
  )
}

export default GenerateEditorials