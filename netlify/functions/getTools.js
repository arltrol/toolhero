const { Configuration, OpenAIApi } = require("openai");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const useCase = body.useCase;
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const prompt = `Suggest 4 AI tools for the following use case: "${useCase}". Format them in JSON with fields: name, description, and link.`;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resultText = response.data.choices[0].message.content;
    return { statusCode: 200, body: JSON.stringify({ tools: resultText }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
