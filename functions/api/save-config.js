export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const configData = await request.json();

    // Read secure environment variables from the Cloudflare Pages configuration dashboard
    const token = env.GITHUB_TOKEN;
    const owner = env.GITHUB_OWNER || 'ehconsultoria';
    const repo = env.GITHUB_REPO || 'ehconsultoria.com.br';
    const branch = env.GITHUB_BRANCH || 'main';

    if (!token) {
      // Return a structured error when env token is missing (instructing the user to set it up)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'GITHUB_TOKEN não está configurado na Cloudflare. Por favor, adicione a variável de ambiente no seu painel da Cloudflare Pages.' 
        }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const filePath = 'src/data/cms-data.json';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    
    // 1. Fetch current file from GitHub to obtain the required 'sha' hash for updating
    let currentSha = '';
    try {
      const getResponse = await fetch(`${apiUrl}?ref=${branch}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cloudflare-Pages-CMS'
        }
      });
      if (getResponse.ok) {
        const getResult = await getResponse.json();
        currentSha = getResult.sha;
      }
    } catch (err) {
      console.warn("Could not retrieve current SHA from GitHub. Writing as new file if it doesn't exist.", err);
    }

    // Convert UTF-8 JSON configuration content to Base64 (UTF-8 safe conversion)
    const jsonStr = JSON.stringify(configData, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));

    // 2. Prepare PUT payload to update the database file on GitHub
    const payload = {
      message: 'chore(cms): update website content from Cloudflare Edge admin panel',
      content: base64Content,
      branch
    };
    if (currentSha) {
      payload.sha = currentSha;
    }

    const putResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudflare-Pages-CMS'
      },
      body: JSON.stringify(payload)
    });

    if (putResponse.ok) {
      return new Response(
        JSON.stringify({ success: true, gitSuccess: true }), 
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      const errResult = await putResponse.json();
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errResult.message || 'Erro ao gravar arquivo no GitHub.' 
        }), 
        {
          status: putResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
