
interface RequestEditorialType {
  statement: string,
  solutions: string[],
  humanRequest: string,
  authToken: string,
}

interface RequestEditorialResponse {
  editorial: string,
}

const RequestEditorial = (request: RequestEditorialType): Promise<RequestEditorialResponse> => {
  return fetch('/api/generate-editorial', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  }).then(async response => {
    if (!response.ok) {
      const content = await response.text()
      throw new Error('Status: ' + response.status + '\n\nMessage: ' + content);
    }
    return response.json()
  })
}


interface RequestSourceCodeType {
  statement: string,
  editorial: string,
  humanRequest: string,
  authToken: string,
}

interface RequestSourceCodeResponse {
  sourceCode: string,
}

const RequestSourceCode = (request: RequestSourceCodeType): Promise<RequestSourceCodeResponse> => {
  return fetch('/api/generate-sourcecode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  }).then(async response => {
    if (!response.ok) {
      const content = await response.text()
      throw new Error('Status: ' + response.status + '\n\nMessage: ' + content);
    }
    return response.json()
  })
}

export { RequestEditorial, RequestSourceCode }
export type { RequestEditorialType, RequestEditorialResponse, RequestSourceCodeType, RequestSourceCodeResponse }