export default async function handler(req, res) {
    const token = process.env.HF_TOKEN;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Metodă nepermisă" });
    }

    try {
        // Verificăm dacă body-ul trebuie parsat sau e deja obiect
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const query = body.query;

        if (!query) throw new Error("Query lipsă");

        const prompt = `Return a JSON object for: "${query}". 
        Format: {"name": "item", "calories": 0, "protein": 0, "carbs": 0, "fat": 0}. 
        Only return JSON.`;

        const response = await fetch("https://api-inference.huggingface.co/models/Mistral-7B-Instruct-v0.2", {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({ 
                inputs: "<s>[INST] " + prompt + " [/INST]",
                parameters: { max_new_tokens: 150, return_full_text: false }
            }),
        });

        const result = await response.json();
        
        // Trimitem rezultatul înapoi la browser
        res.status(200).json(result);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
}
