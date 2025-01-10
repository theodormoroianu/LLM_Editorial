import './App.css'
import React from 'react'
import { Navbar, Alignment, Button, Card, H3 } from '@blueprintjs/core'
import '@blueprintjs/core/lib/css/blueprint.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import GenerateEditorials from './GenerateEditorial'
import GenerateSolution from './GenerateSolution'
import CanvasAnimation from './Animation'


function Home() {
  const cardStyle: React.CSSProperties = {
    marginLeft: '5vh',
    marginRight: '5vh',
    marginTop: '10vh',
  }
  return <div style={{
    height: "100%",
    width: "100%",
    position: "relative",
  }}>
    <div style={{
      position: "absolute",
      height: "100%",
      width: "100%",
      zIndex: -1,
    }}>
      <CanvasAnimation />
    </div>
    <div style={{
      "display": "flex",
      "flexDirection": "row",
      "justifyContent": "center",
    }}>

      <Card elevation={3} style={cardStyle}>
        <H3>Generate Editorials</H3>
        <p>Given a statement and, optionally, a correct solution, generate a detailed editorial of the problem.</p>
        <Button intent="primary" onClick={() => window.location.href = "/generate-editorials"}>Generate Editorials</Button>
      </Card>
      <Card elevation={3} style={cardStyle}>
        <H3>Generate Solutions</H3>
        <p>Given a statement and, optionally, an editorial, generate a correct solution to the problem.</p>
        <Button intent="primary" onClick={() => window.location.href = "/generate-solutions"}>Generate Solutions</Button>
      </Card>
    </div>
  </div>
}

function App() {
  return (

    <Router>
      <div style={{ "height": "100vh", "display": "flex", "flexDirection": "column" }}>
        <div style={{ height: "50px" }}>
          <Navbar style={{ "height": "50px" }}>
            <Navbar.Group align={Alignment.LEFT}>
              <Navbar.Heading>LLM Editorials Checker</Navbar.Heading>
              <Navbar.Divider />
              <Button
                className="bp5-minimal"
                icon="home" text="Home"
                active={window.location.pathname.endsWith('/')}
                onClick={() => window.location.href = '/'}
              />
              <Button
                className="bp5-minimal"
                icon="automatic-updates"
                text="Generate Editorial"
                active={window.location.pathname.endsWith('/generate-editorials')}
                onClick={() => window.location.href = '/generate-editorials'}
              />
              <Button
                className="bp5-minimal"
                icon="automatic-updates"
                text="Generate Solution"
                active={window.location.pathname.endsWith('/generate-solutions')}
                onClick={() => window.location.href = '/generate-solutions'}
              />
            </Navbar.Group>
          </Navbar>
        </div>
        <div style={{
          height: "calc(100vh - 50px)"
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate-editorials" element={<GenerateEditorials />} />
            <Route path="/generate-solutions" element={<GenerateSolution />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
