export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { name, email, phone, company, message, emailConfig } = body;

    // Basic fields validation
    if (!name || !email || !phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Os campos nome, email, telefone e mensagem são obrigatórios.' }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Recipients configurations (Editable corporate CC + Erica's private CC)
    const ccEmailPrimary = 'erica.ehconsultltda@gmail.com';
    const ccEmailCorporate = emailConfig?.ccEmailCorporate || 'contato@ehconsultoria.com.br';

    // Retrieve Resend API Key from Cloudflare environment configuration variables
    const apiKey = env.RESEND_API_KEY;
    
    if (!apiKey) {
      // In local dev/staging without env keys set, simulate email and return success
      console.warn("RESEND_API_KEY is not defined. Email transmission simulated.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          simulated: true, 
          message: 'Envio simulado com sucesso (RESEND_API_KEY ausente).' 
        }), 
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Call Resend REST API endpoint to deliver transactional HTML email
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'EH Consultoria <site@ehconsultoria.com.br>',
        to: [email],
        cc: [ccEmailPrimary, ccEmailCorporate],
        subject: `Contato EH Consultoria - ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #f1f5f9; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0093b8; font-family: sans-serif; font-size: 22px; margin: 0;">EH Consultoria em Saúde Mental</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Confirmação de Recebimento de Mensagem</p>
            </div>
            
            <p style="font-size: 15px; color: #1e293b; line-height: 1.6;">
              Olá, <strong>${name}</strong>,
            </p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">
              Agradecemos seu contato. Confirmamos o recebimento da sua mensagem com sucesso. Nossa equipe de especialistas em psicologia organizacional revisará as informações e entrará em contato em breve.
            </p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Resumo dos Dados:</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 120px;">Empresa:</td>
                  <td style="padding: 6px 0;">${company || 'Não informada'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Telefone:</td>
                  <td style="padding: 6px 0;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Mensagem:</td>
                  <td style="padding: 6px 0; white-space: pre-line;">${message}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 30px;">
              Esta é uma mensagem automática enviada do formulário de captação de leads da EH Consultoria em Saúde Mental (ehconsultoria.com.br).
            </p>
          </div>
        `
      })
    });

    const resendResult = await resendResponse.json();

    if (resendResponse.ok) {
      return new Response(
        JSON.stringify({ success: true, emailId: resendResult.id }), 
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: resendResult.message || 'Erro no processamento da API de e-mails' }), 
        {
          status: resendResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
