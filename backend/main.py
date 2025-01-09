from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from mistralai import Mistral
import logging
import os

logging.basicConfig(level=logging.INFO)


allowed_auth_tokens = {""}
mistral_api_key = os.environ["MISTRAL_API_KEY"]
mistral_model = "mistral-large-latest"
mistral_agent_id = "ag:56a53bd1:20250107:cp-helper:e0ac0c60"
mistral_client = Mistral(api_key=mistral_api_key)


app = FastAPI()


class EditorialRequestType(BaseModel):
    statement: str
    solutions: list[str]
    humanRequest: str
    authToken: str

    def to_message(self):
        ans = "You are tasked with creating a detailed editorial for a competitive programming task. You are given the statement of the problem. If the language is not english, please keep the same language for the editorial.\n"
        if self.solutions:
            ans += f" You are also given {len(self.solutions)} solutions to the problem, for helping you understand the solution."
        ans += "You are tasked to write a detailed editorial for the problem, in a markdown format. The editorals should include the following sections:\n * A short explanation of the statement of the problem.\n * A detailed explanation of the test cases if they help the understanding of the problem.\n * Required well-known algorithms for the problem's solution (if you think it is required).\n * A detailed, step by step explanation of the solution. If some of the provided solutions are different, pick the easiest to understand.\n * A detailed explanation of the expected time complexity of the solution.\n * A detailed explanation of the expected space complexity of the solution.\n"
        if self.humanRequest:
            ans += f"You are also given a human request: `{self.humanRequest}`.\n"

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

    print("Sending the following request:\n\n", request.to_message())
    messages = [
        {
            "role": "user",
            "content": request.to_message(),
        }
    ]

    result = mistral_client.agents.complete(
        agent_id=mistral_agent_id,
        messages=messages,
    )

    editorial = result.choices[0].message.content

    print("Received the following response:\n\n", editorial)
    return EditorialResponseType(editorial=editorial)


@app.post("/api/generate-sourcecode", response_model=SourceCodeResponseType)
async def generate_editorials(request: SourceCodeRequestType):
    if request.authToken not in allowed_auth_tokens:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    print("Sending the following request:\n\n", request.to_message())
    messages = [
        {
            "role": "user",
            "content": request.to_message(),
        }
    ]

    result = mistral_client.agents.complete(
        agent_id=mistral_agent_id,
        messages=messages,
    )

    sourcecode = result.choices[0].message.content

    print("Received the following response:\n\n", sourcecode)
    return SourceCodeResponseType(sourceCode=sourcecode)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
