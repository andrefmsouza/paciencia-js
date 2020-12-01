const jogo = {
    baralho: [],
    pilhas: [ -1, -1, -1, -1, -1, -1, -1 ],
    fundacao: [ -1, -1, -1, -1],
    estoque: [],
    descarte: [],
    //Cria os elementos visuais do jogo
    criar_carta(index){
        //Cria um novo elemento
        const carta = document.createElement("div");
        //Adiciona o estila da carta
        carta.classList.add("carta");
        //Cria o identificados da carta de acordo com a posicao no array do baralho
        carta.id = index;
        //Adiciona os atributos de axibição da carta
        carta.setAttribute("data-cor", this.baralho[index].naipe.cor);
        carta.setAttribute("data-carta", this.baralho[index].nome);
        
        carta.setAttribute("data-naipe", this.baralho[index].naipe.emoji);
        //Desabilita a funcao de movimentacao da carta
        carta.draggable = false;
        //Permite que outras cartas sejam arrastadas até ela
        carta.allowDrop=true;
        //Adiciona as funcoes de validaçao
        carta.ondragstart = drag;
        carta.ondragover = allowDrop;
        carta.ondrop = drop;

        //Adiciona a carta inicialmente à pilha de estoque
        this.estoque.push(index);
        document.getElementById("estoque").appendChild(carta);
    },
    //Adiciona o css que permitira que a carta seja vista pelo jogador
    virar_carta(index, estoque = false){
        //Pega o elemento
        let carta = document.getElementById(index);
        //Adiciona o CSS à carta
        carta.classList.add("carta-virada");
        //Habilita a movimentação da carta
        carta.draggable = true;

        //Se a carta estiver no estoque, move para a pilha de descarte.
        if(estoque){
            document.getElementById("descarte").appendChild(carta);
        }
    },
    //Move as cartas da pilha de descarte para a pilha de estoque
    reset_pilha_estoque(){
        //Faz a troca das pilhas
        this.estoque = this.descarte;
        //Inverte as cartas
        this.estoque.reverse();
        this.descarte = [];

        //Oculta as cartas novamente, fazendo o inverso da funcao virar_carta
        for(let i = 0; i < this.estoque.length; i++){
            let carta = document.getElementById(this.estoque[i]);
            carta.classList.remove("carta-virada");
            carta.draggable = false;

            document.getElementById("estoque").appendChild(carta);
        }
    },
    //Funcao chamada ao clicar na pilha de estoque
    descartar_carta(){
        //Verifica se possui cartas no estoque
        if(this.estoque.length > 0){
            //Move a ultima carta para a pilha de descarte
            let ultima_carta_estoque = this.estoque.splice(-1, 1);
            this.descarte.push(ultima_carta_estoque);
            ultima_carta_estoque = parseInt(ultima_carta_estoque);
    
            this.virar_carta( ultima_carta_estoque, true );
        //Caso nao tenha mais cartas, pega novamente as cartas do descarte
        }else if( this.descarte.length > 0 ){
            this.reset_pilha_estoque();
        }
    }
}

//Evento chamado ao iniciar o movimento de uma carta
function drag(ev) {
    //Guarda o id do elemento que está sendo movido
    ev.dataTransfer.setData("carta", ev.target.id);
}

//Desabilita a funcao padrao ao movimentar uma carta
function allowDrop(ev) {
    ev.preventDefault();
}

//Evento chamado ao soltar uma carta sobre a outra
function drop(ev) {
    ev.preventDefault();

    //Pega os ids de origem e destino para validação da jogada
    var origem = parseInt( ev.dataTransfer.getData("carta") );
    var destino = parseInt(ev.target.id);

    //verifica se o pilha de destino está vazia
    if( !jogo.baralho[destino] ){
        //verifica se a carta é o Rei( K = 13 ) e se o pilha de destino não é o pilha de fundacao
        //A carta inicial das pilhas de montagemte devem ser obrigatoriamente um Rei
        if( jogo.baralho[origem].carta != 13 && ev.target.classList.contains("pilha") ){
            return;
        }

        //verifica se a carta é o Ás( A = 1 ) e se o pilha de destino é o pilha de fundacao
        //A carta inicial das pilhas de fundacao devem ser obrigatoriamente um Ás
        if( jogo.baralho[origem].carta != 1 && ev.target.classList.contains("pilha_fundacao") ){
            return;
        }

        //retira da pilha atual
        if( jogo.baralho[origem].pai != -1 ){
            jogo.baralho[jogo.baralho[origem].pai].filho = -1;

            //adiciona o css da carta virada ao elemento pai
            let elemento_pai = document.getElementById(jogo.baralho[origem].pai);
            if( !elemento_pai.classList.contains("carta-virada") )
                jogo.virar_carta(jogo.baralho[origem].pai);
        }

        //verifica se a carta de origem está no pilha de estoque
        if( document.querySelector(`.pilha_descarte [data-carta="${jogo.baralho[origem].nome}"][data-naipe="${jogo.baralho[origem].naipe.emoji}"]`) ){
            //remove do pilha de estoques
            jogo.descarte.splice(-1, 1);    
        }

        //move o elemento para o destino
        ev.target.appendChild( document.getElementById(origem) );

    //verifica se é o final da pilha
    }else if( jogo.baralho[destino].filho == -1 ){
        //verifica se a carta de destino está no pilha de descarte
        //Cartas nao podem ser adicionas à pilha de descarte
        if( document.querySelector(`.pilha_descarte [data-carta="${jogo.baralho[destino].nome}"][data-naipe="${jogo.baralho[destino].naipe.emoji}"]`) ){
            return;
        }

        //verifica se a carta de destino está fora do pilha de fundacao
        //Cartas da pilha de montagem devem ser de naipes de cor diferentes e seguindo uma ordem decrescente
        if( document.querySelector(`.pilha [data-carta="${jogo.baralho[destino].nome}"][data-naipe="${jogo.baralho[destino].naipe.emoji}"]`) ){
            //verifica se a carta destino é maior que a carta de origem
            if( jogo.baralho[destino].carta != jogo.baralho[origem].carta + 1 ){
                return;
            }
    
            //verifica a cor das cartas
            if( jogo.baralho[destino].naipe.cor == jogo.baralho[origem].naipe.cor ){
                return;
            }
        //verifica se a carta de destino está na pilha de fundacao
        //Cartas da pilha de fundacao devem ser do mesmo naipe em seguindo uma ordem crescente
        }else if( document.querySelector(`.pilha_fundacao [data-carta="${jogo.baralho[destino].nome}"][data-naipe="${jogo.baralho[destino].naipe.emoji}"]`) ){
            //verifica se a carta destino é menor que a carta de origem
            if( jogo.baralho[destino].carta != jogo.baralho[origem].carta - 1 ){
                return;
            }
    
            //verifica o naipe das cartas
            if( jogo.baralho[destino].naipe.nome != jogo.baralho[origem].naipe.nome ){
                return;
            }
        }

        //Caso esteja tudo ok com a jogada, realiza o movimento

        //Remove o encadeamento com a carta pai (caso haja)
        if( jogo.baralho[origem].pai != -1 ){
            jogo.baralho[jogo.baralho[origem].pai].filho = -1;

            //Caso a carta pai esteja oculta, adiciona o css da carta virada ao elemento pai
            let elemento_pai = document.getElementById(jogo.baralho[origem].pai);
            if( !elemento_pai.classList.contains("carta-virada") )
                jogo.virar_carta(jogo.baralho[origem].pai);
        }
        //coloca na pilha destino
        jogo.baralho[origem].pai = destino;
        jogo.baralho[destino].filho = origem;

        //verifica se a carta de origem está no pilha de descarte
        if( document.querySelector(`.pilha_descarte [data-carta="${jogo.baralho[origem].nome}"][data-naipe="${jogo.baralho[origem].naipe.emoji}"]`) ){
            //remove do pilha de descarte
            jogo.descarte.splice(-1, 1);    
        }
            
        //move o elemento para o destino
        ev.target.appendChild( document.getElementById(origem) );

        //verifica se é o fim do jogo
        let qtd_cartas_fundacao = document.querySelectorAll(".fundacoes .carta");
        if(qtd_cartas_fundacao.length == jogo.baralho.length ){
            //Exibe mensagem de parabéns e inicia um novo jogo(atualiza a tela)
            if( confirm("Parabens, você ganhou o jogo!") ){
                window.location.reload();
            }
        }

    }
}

function main(){
    //Cria e embaralha as cartas
    jogo.baralho = embaralhar( criar_baralho() );

    //Cria os elementos visuais do baralho
    for( index in jogo.baralho )
        jogo.criar_carta(index);
    
    /*
        Inicialmente, todas as cartas vão para o estoque.
        Para iniciar o jogo, as cartas de cima da pilha do estoque são movidas para as pilhas de carta do jogo,
        começando com 1 carta na primeira pilha, 2 na segunda, 3 na terceira e assim por diante até a 7ª pilha.
    */
    //Variavel auxiliar contendo a posicao do array na pilha de estoque
    var aux = jogo.baralho.length - 1;
    //Percorre as 7 pilhas de montagem de cartas
    for( var i = 0; i < 7; i++ ){
        //Variavel auxiliar contendo o id do elemento html da pilha
        let aux2 = `pilha${i+1}`;
        //Adiciona a quantidade certa de carta para cada pilha
        for(var j = 1; j <= i+1; j++){
            //Move o elemento do estoque para a pilha atual
            document.getElementById(aux2).appendChild( document.getElementById(aux) );
            
            //Verifica se é a primeira carta da pilha, que deverá ser setada sem nenhum elemento pai e filho
            if(j == 1){
                jogo.baralho[aux].pai = -1;
                jogo.baralho[aux].filho = -1;
            //Caso nao seja, faz o relacionamento da carta atual com a carta anterior para que tenhamos uma lista
            //duplamento encadeada
            }else{
                jogo.baralho[aux].pai = aux+1;
                jogo.baralho[aux+1].filho = aux;
            }

            //Se for a ultima carta da pilha, vira a carta, caso contrario a carta deverá permanecer oculta para o jogador.
            if(j == i+1){
                jogo.virar_carta(aux);
            }

            //Remove a carta da pilha do estoque
            jogo.estoque.splice(aux, 1);

            //Atualiza as variaveis de controle
            aux2 = aux;
            aux--;
        }
    }
}

main();