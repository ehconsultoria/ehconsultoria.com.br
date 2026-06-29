export async function onRequestGet(context) {
  try {
    const { env } = context;
    const token = env.GITHUB_TOKEN;
    const owner = env.GITHUB_OWNER || 'ehconsultoria';
    const repo = env.GITHUB_REPO || 'ehconsultoria.com.br';
    const branch = env.GITHUB_BRANCH || 'main';

    if (!token) {
      // If token is missing, return empty array (local dev fallback)
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const folderPath = 'public/uploads';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}?ref=${branch}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudflare-Pages-CMS'
      }
    });

    if (response.status === 404) {
      // Directory does not exist yet, return empty list
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Erro ao listar mídias do GitHub.');
    }

    const files = await response.json();
    
    // Map list of repository uploads excluding the hidden gitkeep tracking file
    const mediaFiles = files
      .filter(file => file.type === 'file' && file.name !== '.gitkeep')
      .map(file => ({
        name: file.name,
        sha: file.sha,
        size: file.size,
        url: `/uploads/${file.name}`,
        downloadUrl: file.download_url
      }));

    return new Response(JSON.stringify(mediaFiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { filename, content } = body; // Base64 raw contents

    const token = env.GITHUB_TOKEN;
    const owner = env.GITHUB_OWNER || 'ehconsultoria';
    const repo = env.GITHUB_REPO || 'ehconsultoria.com.br';
    const branch = env.GITHUB_BRANCH || 'main';

    if (!token) {
      return new Response(JSON.stringify({ error: 'GITHUB_TOKEN não está configurado na Cloudflare.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = `public/uploads/${filename}`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // Read current file to obtain SHA (required by GitHub content updates for overwrites)
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
      // Ignored
    }

    const payload = {
      message: `media(cms): upload image ${filename}`,
      content,
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
      return new Response(JSON.stringify({ success: true, url: `/uploads/${filename}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const err = await putResponse.json();
      throw new Error(err.message || 'Erro ao fazer upload da imagem.');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { filename, sha } = body;

    const token = env.GITHUB_TOKEN;
    const owner = env.GITHUB_OWNER || 'ehconsultoria';
    const repo = env.GITHUB_REPO || 'ehconsultoria.com.br';
    const branch = env.GITHUB_BRANCH || 'main';

    if (!token) {
      return new Response(JSON.stringify({ error: 'GITHUB_TOKEN não está configurado na Cloudflare.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = `public/uploads/${filename}`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const payload = {
      message: `media(cms): delete image ${filename}`,
      sha,
      branch
    };

    const deleteResponse = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudflare-Pages-CMS'
      },
      body: JSON.stringify(payload)
    });

    if (deleteResponse.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const err = await deleteResponse.json();
      throw new Error(err.message || 'Erro ao deletar imagem.');
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
