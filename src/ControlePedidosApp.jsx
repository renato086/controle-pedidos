import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Plus, Trash } from 'lucide-react';
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

export default function ControlePedidosApp() {
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unitario, setUnitario] = useState('');
  const [status, setStatus] = useState('EM PREPARO');
  const [pedidos, setPedidos] = useState([]);

  // Carrega pedidos em tempo real, ordenados por timestamp
  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const dados = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPedidos(dados);
    });
    return () => unsubscribe();
  }, []);

  // Adiciona novo pedido ao Firestore
  async function adicionarPedido() {
    if (!descricao || !quantidade || !unitario) return;
    const qnt = parseInt(quantidade, 10);
    const uni = parseFloat(unitario);
    await addDoc(collection(db, "pedidos"), {
      descricao,
      quantidade: qnt,
      unitario: uni,
      total: qnt * uni,
      status,
      timestamp: serverTimestamp()
    });
    setDescricao('');
    setQuantidade('');
    setUnitario('');
    setStatus('EM PREPARO');
  }

  // Remove pedido do Firestore
  async function removerPedido(id) {
    await deleteDoc(doc(db, "pedidos", id));
  }

  // Soma total de todos os pedidos
  const totalPedido = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Container principal */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center">📦 Controle de Pedidos</h1>

        {/* Formulário de criação */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <Input
                placeholder="Descrição da peça"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                className="w-full"
              />
              <Input
                placeholder="Quantidade"
                type="number"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                className="w-full"
              />
              <Input
                placeholder="Valor Unitário"
                type="number"
                value={unitario}
                onChange={e => setUnitario(e.target.value)}
                className="w-full"
              />
              <Select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full"
              >
                <SelectItem value="EM PREPARO">EM PREPARO</SelectItem>
                <SelectItem value="FINALIZADO">FINALIZADO</SelectItem>
                <SelectItem value="ENTREGUE">ENTREGUE</SelectItem>
              </Select>
              <Button
                onClick={adicionarPedido}
                className="flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de pedidos */}
        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Unitário</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.descricao}</TableCell>
                    <TableCell>{p.quantidade}</TableCell>
                    <TableCell>R$ {p.unitario.toFixed(2)}</TableCell>
                    <TableCell className="font-bold">
                      R$ {p.total.toFixed(2)}
                    </TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removerPedido(p.id)}
                      >
                        <Trash className="w-4 h-4 mx-auto" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pedidos.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-400"
                    >
                      Nenhum pedido registrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Total geral do pedido */}
            <div className="text-right mt-4 font-bold text-xl">
              Total do Pedido: R$ {totalPedido.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
