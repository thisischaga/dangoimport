import API_BASE_URL from '../apiConfig';

export async function fetchOrderQrTokens(orderId, token) {
  const response = await fetch(`${API_BASE_URL}/api/qr/generate/${orderId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Impossible de générer le code QR.');
  }

  return payload.data || payload;
}
