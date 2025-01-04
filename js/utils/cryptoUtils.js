// Ключ для шифрования (генерируется один раз)
export async function generateKey() {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Сохранение ключа
export async function saveKey(key) {
  const exportedKey = await crypto.subtle.exportKey("jwk", key);
  localStorage.setItem('encryptionKey', JSON.stringify(exportedKey));
}

// Загрузка ключа
export async function loadKey() {
  const savedKey = localStorage.getItem('encryptionKey');
  if (!savedKey) {
    throw new Error("Ключ не найден в localStorage");
  }
  return await crypto.subtle.importKey(
    "jwk",
    JSON.parse(savedKey),
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// Генерация ключа с сохранением, если ключ ещё не был создан
export async function getKey() {
  try {
    return await loadKey();
  } catch (error) {
    console.warn("Ключ не найден, создаём новый");
    const key = await generateKey();
    await saveKey(key);
    return key;
  }
}

// Шифрование значения
export async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Инициализационный вектор (IV)
  const encodedData = encoder.encode(data); // Кодируем строку в байты

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encodedData
  );

  return {
    iv: Array.from(iv), // Преобразуем Uint8Array в массив
    encryptedData: Array.from(new Uint8Array(encrypted)), // Преобразуем зашифрованные данные в массив
  };
}

// Расшифровка значения
export async function decryptData(encryptedData, iv, key) {
  if (!(key instanceof CryptoKey)) {
    throw new Error("Ключ не является объектом CryptoKey");
  }

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv), // Преобразуем массив обратно в Uint8Array
      },
      key,
      new Uint8Array(encryptedData) // Преобразуем массив обратно в Uint8Array
    );

    // Декодируем данные в строку
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Ошибка при расшифровке данных:", error.message);
    throw new Error(`Ошибка в расшифровке данных: ${error.message}`);
  }
}