export default async function handler(req, res) {
    // Luăm token-ul din mediul securizat Vercel
    const token = process.env.HF_TOKEN;
    const { query } = JSON.parse(req.body);

    const prompt = `Return a JSON object for: "${query}". 
    Format: {"name": "item", "calories": 0, "protein": 0, "carbs": 0, "fat": 0}.`;

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/Mistral-7B-Instruct-v0.2", {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({ 
                inputs: "<s>[INST] " + prompt + " [/INST]",
                parameters: { max_new_tokens: 100 }
            }),
        });

        const result = await response.json();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Eroare la serverul AI" });
    }
}
