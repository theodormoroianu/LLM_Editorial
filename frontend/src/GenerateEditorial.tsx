import { useState } from 'react'
import { Markdown } from 'react-showdown'
import { RequestEditorialType, RequestEditorialResponse, RequestEditorial } from './api'
import React from 'react'
import { Button, Card, H3, Label, ProgressBar, TextArea } from '@blueprintjs/core'

function GenerateEditorials() {
  const [statement, setStatement] = useState('')
  const [solutions, setSolutions] = useState<string[]>([])
  const [humanRequest, setHumanRequest] = useState('')
  const [editorial, setEditorial] = useState('Press submit to generate the editorial...')
  const [generating, setGenerating] = useState(false)
  const [authToken, setAuthToken] = useState(window.localStorage.getItem('authToken') || '')
  const [model, setModel] = useState<"mistral" | "gemini">("mistral")

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
      padding: "20px",
      display: "flex",
      flexDirection: "row",
    }}>

      <div style={{
        width: "50%",
        padding: "20px",
      }}>
        <H3>Problem Details</H3>
        <Label>
          1. Problem Statement
          <TextArea
            value={statement}
            fill
            onChange={(e) => setStatement(e.target.value)}
            style={{ minHeight: "200px" }}
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
              style={{ minHeight: "200px" }}
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
            style={{ minHeight: "200px" }}
          />
        </Label>

        <Label style={{ paddingTop: "20px" }}>
          4. Model
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as "mistral" | "gemini")}
            style={{ width: "100%" }}
          >
            <option value="mistral">Mistral</option>
            <option value="gemini">Gemini</option>
          </select>
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
          Generate Editorial
        </Button>
      </div>
      <div style={{
        width: "50%",
        padding: "20px",
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

        <Card>
          <Markdown markup={editorial} markdown={editorial} />
        </Card>
      </div>
    </div >
  )
}

export default GenerateEditorials