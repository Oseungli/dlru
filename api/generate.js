module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST method.' });
  }

  try {
    const { wakeTime = '07:00', reason = '새로운 하루 시작', style = '친절' } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. 폴백 응답을 반환합니다.");
      return res.status(200).json(getFallbackData(wakeTime, reason, style));
    }

    const systemPrompt = `
당신은 반익명 AI 모닝콜 커뮤니티 'ALLAM'의 맞춤형 AI 알람 시스템입니다.
사용자의 기상 시간, 기상 이유, 선호하는 상호작용 스타일에 맞추어 모닝콜 문구, 동기부여 메시지, 습관 개선 팁을 작성해주세요.

[사용자 입력 정보]
- 목표 기상 시간: ${wakeTime}
- 기상 이유 / 오늘 목표: ${reason}
- 선호 스타일: ${style} (친절: 따뜻하고 부드러운 톤 / 일반: 명확하고 정돈된 비서 톤 / 친구: 유쾌하고 친근한 반말 톤 / 교관: 엄격하고 절제된 스파르타 교관 톤)

[응답 요구사항]
반드시 다음 키를 포함하는 **순수 JSON 형식**으로만 응답해야 합니다 (마크다운 포맷이나 'json' 텍스트 블록 없이 순수 JSON만 출력):
{
  "alarmCall": "선택한 스타일에 맞게 기상 시간과 기상 이유를 언급하며 잠을 깨워주는 2~3문장의 모닝콜 문구",
  "motivation": "오늘의 기상 목적을 완수할 수 있도록 격려하는 1~2문장의 강렬한 동기부여 메시지",
  "tip": "아침 기상 후 바로 실천할 수 있는 1문장의 실용적인 건강/습관 개선 팁"
}
`;

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API Error (${geminiResponse.status}):`, errorText);
      return res.status(200).json(getFallbackData(wakeTime, reason, style));
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(200).json(getFallbackData(wakeTime, reason, style));
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseError) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from AI");
      }
    }

    return res.status(200).json({
      alarmCall: parsedResult.alarmCall || `${wakeTime}입니다! '${reason}' 목표를 향해 지금 일어나세요!`,
      motivation: parsedResult.motivation || "오늘 아침의 작은 실천이 당신의 위대한 하루를 만듭니다.",
      tip: parsedResult.tip || "창문을 열어 신선한 공기를 마시고 물 한 잔으로 몸을 깨우세요."
    });

  } catch (error) {
    console.error("서버리스 함수 실행 오류:", error);
    const { wakeTime = '07:00', reason = '아침 기상', style = '일반' } = req.body || {};
    return res.status(200).json(getFallbackData(wakeTime, reason, style));
  }
};

function getFallbackData(wakeTime, reason, style) {
  const stylePrefix = {
    '친절': '좋은 아침이에요! 🌸 ',
    '일반': '알림: ',
    '친구': '야! 얼른 일어나! ⏰ ',
    '교관': '기상! 기상! 💥 '
  };

  const prefix = stylePrefix[style] || '';

  return {
    alarmCall: `${prefix}설정하신 ${wakeTime}입니다. 오늘 '${reason}'(을)를 이룰 시간이 되었습니다. 지금 눈을 뜨고 활기차게 시작해보세요!`,
    motivation: "아침에 정해진 시간에 일어나는 것만으로도 당신은 이미 오늘 하루의 첫 번째 승리를 거두었습니다.",
    tip: "침대에서 나온 즉시 가벼운 몸풀기 스트레칭을 1분간 진행해보세요."
  };
}
