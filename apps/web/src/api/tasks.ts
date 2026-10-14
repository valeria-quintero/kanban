const API_URL = 'http://localhost:3000/api'

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-type': 'application/json',
            ...options?.headers,
        }
    })

    if (!response.ok) {
        throw new Error (`Error ${response.status}`)
    }
    
    return response.json() as Promise<T>

}