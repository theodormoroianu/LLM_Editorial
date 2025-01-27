from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from mistralai import Mistral
import logging
import os
import google.generativeai as genai

logging.basicConfig(level=logging.INFO)

# Allowed tokens for securing the API
allowed_auth_tokens = {os.environ["ALLOWED_TOKEN"]}

# Mistral API key and model
mistral_api_key = os.environ["MISTRAL_API_KEY"]
mistral_model = "mistral-large-latest"
mistral_agent_id = "ag:56a53bd1:20250107:cp-helper:e0ac0c60"
mistral_client = Mistral(api_key=mistral_api_key)

# Gemini API key and model
gemini_api_key = os.environ["GEMINI_API_KEY"]
gemini_model = "gemini-large-latest"
genai.configure(api_key=gemini_api_key)
gemini_client = genai.GenerativeModel("gemini-1.5-flash")

# FastAPI app
app = FastAPI()


def ask_mistral(question: str) -> str:
    """
    Ask a question to the Mistral model
    """
    messages = [
        {
            "role": "user",
            "content": question,
        }
    ]

    result = mistral_client.agents.complete(
        agent_id=mistral_agent_id,
        messages=messages,
    )

    return result.choices[0].message.content


def ask_gemini(question: str) -> str:
    """
    Ask a question to the Gemini model
    """
    return gemini_client.generate_content(question).text


class SolutionGradingRequestType(BaseModel):
    statement: str
    editorial: str
    solutionToGrade: str
    humanRequest: str
    authToken: str
    model: str

    def to_message(self):
        ans = "You are tasked with grading a solution for a competitive programming task. You are given the statement of the problem, an editorial, and the solution to grade.\n"

        if self.humanRequest:
            ans += f"You are also given a human request: `{self.humanRequest}`.\n"

        ans += "You are now given the statement, between [START] and [END] blocks.\n"
        ans += "\n\n[START]\n" + self.statement + "\n[END]\n"

        ans += "You are now given the editorial, between [START] and [END] blocks.\n"
        ans += "\n\n[START]\n" + self.editorial + "\n[END]\n"

        ans += "You are now given the solution to grade, between [START] and [END] blocks.\n"
        ans += "\n\n[START]\n" + self.solutionToGrade + "\n[END]\n"

        ans += "Additional notes:\n"
        ans += "* Sometimes, due to some issues, the statement is not coherent (or missing). If this is the case, and the statement does not look like a standard problem statement, please say that instead of generating a meaningless grading.\n"
        ans += "* If you think the solution is too hard to grade, and are unable to generate a perfectly accurate grading, say that instead of generating a possibly incorrect grading.\n"
        ans += "* Only generate the grading as a single string.\n"
        ans += "* Do not include quotes or backticks to isolate the grading, as the user expects to only receive one string.\n"
        ans += "* Your whole reply must be a valid grading, DO NOT ADD ANYTHING ELSE, SUCH AS BACKTICKS OR QUOTES. Your output must only contain the grading.\n"
        ans += "* If you need to add additional information, please add it as a comment in the grading.\n"
        ans += "\nPlease only answer with the grading as requested, as it is directly sent back to the user, do not send any other information."

        return ans


class SolutionGradingResponseType(BaseModel):
    grading: str


class EditorialRequestType(BaseModel):
    statement: str
    solutions: list[str]
    humanRequest: str
    authToken: str
    model: str
    stepByStep: bool

    def to_message(self):
        ans = "You are tasked with creating a detailed editorial for a competitive programming task. You are given the statement of the problem. If the language is not english, please keep the same language for the editorial.\n"
        if self.solutions:
            ans += f" You are also given {len(self.solutions)} solutions to the problem, for helping you understand the solution."
        ans += "You are tasked to write a detailed editorial for the problem, in a markdown format. The editorals should include the following sections:\n * A short explanation of the statement of the problem.\n * A detailed explanation of the test cases if they help the understanding of the problem.\n * Required well-known algorithms for the problem's solution (if you think it is required).\n * A detailed explanation of the expected time complexity of the solution.\n * A detailed explanation of the expected space complexity of the solution.\n"
        if self.humanRequest:
            ans += f"You are also given a human request: `{self.humanRequest}`.\n"

        if self.stepByStep:
            ans += "You are requested to provide a step-by-step explanation of the solution. "
            ans += "This means that you have to provide an easy way to understand the solution, with a step-by-step explanation of the solution.\n"
            ans += "If a given step requires some algorithms or datastructures, explain them in the step.\n"

        ans += "You are now given the statement, between [START] and [END] blocks.\n"
        ans += "\n\n[START]\n" + self.statement + "\n[END]\n"
        if self.solutions:
            ans += "You are now given the solutions, between [START] and [END] blocks."
            for nr, solution in enumerate(self.solutions):
                ans += (
                    f"\n\nSolution {nr + 1}/{len(self.solutions)} [START]\n"
                    + solution
                    + "\n[END]\n"
                )

        ans += "Additional notes:\n"
        ans += "* The markdown editor the user uses is kinda stupid, please add new lines after each code block.\n"
        ans += "* Please add C++ snippet code blocks wherever it helps with the understanding. the editor does not know how to handle c++ code, so just add them as regular code.\n"
        ans += "* Do not forget to KEEP THE ORIGINAL LANGUAGE of the statement for the editorial.\n"
        ans += "* Sometimes, due to some issues, the statement is not coherent (or missing). If this is the case, and the statement does not look like a standard problem statement, please say that instead of generating a meaningless editorial.\n"

        ans += "\nPlease only answer with the editorial as requested, as it is directly sent back to the user, do not send any other information."

        return ans


class EditorialResponseType(BaseModel):
    editorial: str


class SourceCodeRequestType(BaseModel):
    statement: str
    editorial: str
    humanRequest: str
    authToken: str
    model: str

    def to_message(self):
        ans = "You are tasked with generating a 100% working, valid, correct solution for a competitive programming task. You are given the statement of the problem and an editorial, which describes the solution you need to follow.\n"

        if self.humanRequest:
            ans += f"You are also given a human request: `{self.humanRequest}`.\n"

        ans += "You are now given the statement, between [START] and [END] blocks.\n"
        ans += "\n\n[START]\n" + self.statement + "\n[END]\n"

        ans += "You are now given the editorial, between [START] and [END] blocks.\n"
        ans += "\n\n[START]\n" + self.editorial + "\n[END]\n"

        ans += "Additional notes:\n"
        ans += "* Sometimes, due to some issues, the statement is not coherent (or missing). If this is the case, and the statement does not look like a standard problem statement, please say that instead of generating a meaningless code.\n"
        ans += "* If you think the solution is too hard, and are unable to generate a 100% working solution, say that instead of generating a possibly incorrect solution.\n"
        ans += "* Only generate C++ code.\n"
        ans += "* Do not include quotes or backticks to isolate the code, as the user expects to only receive one code block.\n"
        ans += "* Your whole reply must by a valid c++ code, DO NOT ADD ANYTHING ELSE, SUCH AS BACKTICKS OR QUOTES. Your output must only contain valid c++ code.\n"
        ans += "* If you need to add additional information, please add it as a comment in the code.\n"
        ans += "\nPlease only answer with the code as requested, as it is directly sent back to the user, do not send any other information."

        return ans


class SourceCodeResponseType(BaseModel):
    sourceCode: str


@app.post("/api/generate-editorial", response_model=EditorialResponseType)
async def generate_editorials(request: EditorialRequestType):
    if request.authToken not in allowed_auth_tokens:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    if request.model not in ["gemini", "mistral"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid model",
        )

    if request.model == "mistral":
        editorial = ask_mistral(request.to_message())
    else:
        editorial = ask_gemini(request.to_message())

    return EditorialResponseType(editorial=editorial)


@app.post("/api/generate-sourcecode", response_model=SourceCodeResponseType)
async def generate_editorials(request: SourceCodeRequestType):
    if request.authToken not in allowed_auth_tokens:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    if request.model not in ["gemini", "mistral"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid model",
        )

    if request.model == "mistral":
        sourcecode = ask_mistral(request.to_message())
    else:
        sourcecode = ask_gemini(request.to_message())

    return SourceCodeResponseType(sourceCode=sourcecode)


@app.post("/api/grade-solution", response_model=SolutionGradingResponseType)
async def grade_solution(request: SolutionGradingRequestType):
    if request.authToken not in allowed_auth_tokens:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    if request.model not in ["gemini", "mistral"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid model",
        )

    if request.model == "mistral":
        grading = ask_mistral(request.to_message())
    else:
        grading = ask_gemini(request.to_message())

    return SolutionGradingResponseType(grading=grading)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
