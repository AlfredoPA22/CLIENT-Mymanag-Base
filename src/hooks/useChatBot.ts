import { useState } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Eres un asistente de ayuda integrado en MyManag, un sistema de gestión empresarial. Tu función es responder dudas sobre cómo usar el sistema de forma clara, concisa y en español.

El sistema MyManag incluye los siguientes módulos:

**INVENTARIO**
- Productos: crear, editar, buscar y filtrar productos. Cada producto tiene nombre, categoría, marca, precio de costo, precio de venta, stock mínimo y tipo de stock (unidades o peso).
- Bajo stock: lista de productos cuyo stock está por debajo del mínimo configurado.
- Almacenes: gestionar los almacenes donde se guarda el inventario. Se necesitan al menos 2 almacenes para hacer transferencias.
- Marcas: crear y editar marcas asociadas a productos.
- Categorías: organizar productos por categorías.
- Importar productos: importar masivamente productos desde un archivo.

**COMPRAS**
- Órdenes de compra: crear órdenes de compra a proveedores. Al aprobar una orden, el stock de los productos se incrementa automáticamente.
- Proveedores: registrar y editar proveedores (nombre, dirección, teléfono).
- Flujo recomendado: Productos → Proveedores → Orden de compra → Aprobar.

**VENTAS**
- Órdenes de venta: crear ventas asignando cliente, productos y método de pago. Al aprobar, el stock disminuye automáticamente.
- Clientes: registrar y editar clientes (nombre, correo, teléfono, dirección).
- Pagos: registrar pagos parciales para ventas a crédito.
- Flujo recomendado: Clientes → Orden de venta → Aprobar.

**TRANSFERENCIAS**
- Transferir productos entre almacenes. Requiere almacén origen, destino y los productos con cantidades.
- Al aprobar, el stock se mueve del almacén origen al destino.

**REPORTES**
- Generar reportes de productos, compras y ventas. Exportables a PDF.

**ADMINISTRACIÓN**
- Usuarios: crear usuarios y asignarles roles.
- Roles y permisos: definir roles con permisos específicos para controlar el acceso a módulos.

**CONFIGURACIÓN**
- Mi empresa: configurar datos de la empresa.

Reglas de comportamiento:
- Responde siempre en español.
- Sé conciso pero completo.
- Si el usuario pregunta algo que no está relacionado con el sistema, amablemente redirige la conversación al sistema.
- Usa listas y formato cuando sea útil para la claridad.
- Si el usuario describe un problema o error, sugiere pasos concretos para resolverlo.`;

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

export const useChatBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (userText: string) => {
    if (!userText.trim()) return;
    if (!API_KEY) {
      setError("API key no configurada. Agrega VITE_ANTHROPIC_API_KEY en tu archivo .env");
      return;
    }

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        const detail = errBody?.error?.message ?? response.statusText;
        throw new Error(`Error ${response.status}: ${detail}`);
      }

      const data = await response.json();
      const assistantText = data.content?.[0]?.text ?? "Sin respuesta.";

      setMessages([...newMessages, { role: "assistant", content: assistantText }]);
    } catch (err: any) {
      setError(err.message ?? "Error al conectar con el asistente.");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, clearMessages };
};
