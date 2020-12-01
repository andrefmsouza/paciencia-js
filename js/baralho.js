/*
    Declara os naipes do baralho
*/
const naipes = [
    {
       emoji: "♠️",
       nome: "espadas",
       cor: "black"
    },
    {
        emoji: "♣️",
        nome: "paus",
        cor: "black"
    },
    {
        emoji: "♥️",
        nome: "copas",
        cor: "red"
    },
    {
        emoji: "♦️",
        nome: "ouros",
        cor: "red"
    }
];

/*
    Declara o número de cartas por naipe.
    Utilizado para gerar as cartas do baralho.
*/
const numero_cartas = 13;

/*
    Cria um array com as cartas do baralho.
*/
function criar_baralho(){
    let b = [];

    //Percorre todos os naipes
    for( i in naipes ){
        //Cria cada uma das cartas definidas na constante (padrao: 13)
        for( let carta = 1; carta <= numero_cartas; carta++ ){
            //Define um nome de exibição da carta
            let nome;

            switch(carta ){
                case 1: nome = 'A'; break;
                case 11: nome = 'J'; break;
                case 12: nome = 'Q'; break;
                case 13: nome = 'K'; break;
                default: nome = carta; break;
            }

            //Adiciona a carta à lista de cartas do baralho
            b.push({
                //numero da carta
                carta,
                //Nome de exibicao da carta
                nome,
                /* 
                    Utilizado nas pilhas como lista duplamente encadeada
                    Guarda a posição no array das cartas que a carta atual está vinculada

                    Exemplo:

                    K ♥️ (25)
                    |- Q ♣️ (37)
                        |- J ♦️ (49)

                    A carta Q ♣️ possui a carta pai K ♥️, com ID 25, e a carta filho J ♦️, com ID 49.

                    Inicialmente, as cartas possuem valor -1, indicando que está na pilha de estoque/descarte.
                */
                pai: -1,
                filho: -1,
                //Informações do naipe da carta, para validação das pilhas e exibição em tela.
                naipe: naipes[i]
            });
        }
    }

    return b;
}

/* 
    Função para embaralhar as cartas
*/
function embaralhar(baralho) { 
    //Carta que será movimentada. Inicia com a ultima posição do array e vai decrementando até chegar a zero
    var m = baralho.length;
    //Variavel temporaria para auxiliar a troca das cartas do array
    var t;
    //Indice da carta randomica que será trocada com a carta da variavel m
    var i;
  
    // verifica se todas as posicoes foram percorridas
    while (m) {
  
      // Pega um elemento randomico no restante do array
      i = Math.floor(Math.random() * m--);
  
      // Guarda o valor da carta que está sendo movimentada.
      t = baralho[m];
      //Posicao atual recebe a carta randomica
      baralho[m] = baralho[i];
      //Posica da carta randomica, recebe a carta que está sendo movimentada
      baralho[i] = t;
    }
  
    //retorna o array embaralhado
    return baralho;
  }