import Worker, { NotificationType, Product } from "./worker";

const DEFAULT_UPDATE_DELAY = 1000 * 60

const worker = new Worker()

worker.on(NotificationType.FIRST_RESTOCK, (product: Product) => {
  console.log(product.name)
})

worker.add('Growth - CREATINA (250g) Creapure®', 'https://www.gsuplementos.com.br/creatina-250g-creapure-growth-supplements-p985824', '#finalizarCompra > button', DEFAULT_UPDATE_DELAY)
worker.add('Growth - (TOP) WHEY PROTEIN CONCENTRADO (1KG)', 'https://www.gsuplementos.com.br/whey-protein-concentrado-1kg-growth-supplements-p985936', '#finalizarCompra > button', DEFAULT_UPDATE_DELAY)