let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

const jogo = {
    baralho: [],
    pilhas: [ -1, -1, -1, -1, -1, -1, -1 ],
    fundacao: [ -1, -1, -1, -1],
    estoque: [],
    descarte: [],
    
    //Cria os elementos visuais do jogo
    criar_carta(index){
        const carta = document.createElement("div");
        carta.classList.add("carta");
        carta.id = index;
        carta.setAttribute("data-cor", this.baralho[index].naipe.cor);
        carta.setAttribute("data-carta", this.baralho[index].nome);
        carta.setAttribute("data-naipe", this.baralho[index].naipe.emoji);

        // Mantém os eventos de mouse
        carta.draggable = true;
        carta.addEventListener('dragstart', drag, { passive: true });
        carta.addEventListener('dragover', allowDrop);
        carta.addEventListener('drop', drop, { passive: true });
        carta.addEventListener('touchstart', touchstart, { passive: true });
        carta.addEventListener('touchmove', touchmove, { passive: true });
        carta.addEventListener('touchend', touchend, { passive: true });

        this.estoque.push(index);
        document.getElementById("estoque").appendChild(carta);
    },
    //Adiciona o css que permitira que a carta seja vista pelo jogador
    virar_carta(index, estoque = false){
        //Pega o elemento
        let carta = document.getElementById(index);
        //Adiciona o CSS à carta
        carta.classList.add("carta-virada");
        
        // Mantém os eventos de mouse
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
    descartar_carta() {
        
        //Verifica se possui cartas no estoque
        if(this.estoque.length > 0){
            //Move a ultima carta para a pilha de descarte
            let ultima_carta_estoque = this.estoque.splice(-1, 1);
            this.descarte.push(ultima_carta_estoque);
            ultima_carta_estoque = parseInt(ultima_carta_estoque);
    
            this.virar_carta(ultima_carta_estoque, true);
        //Caso nao tenha mais cartas, pega novamente as cartas do descarte
        } else if(this.descarte.length > 0){
            this.reset_pilha_estoque();
        }
    },
    //Verifica se o jogo acabou
    verificarFimDeJogo() {
        // Conta quantas cartas existem nas fundações
        const cartasNasFundacoes = document.querySelector('.fundacoes').getElementsByClassName('carta').length;

        if(cartasNasFundacoes === 52) {
            alert('Parabéns! Você venceu o jogo!');
        }
    }
}

function touchstart(e){
    draggedElement = e.target;

    e.target.dataset.cartaId = e.target.id;
    
    const touch = e.touches[0];
    const rect = draggedElement.getBoundingClientRect();
    
    // Ajusta o offset para o centro da carta
    offsetX = rect.width / 2;
    offsetY = rect.height / 2;
    
    draggedElement.style.position = 'fixed';
    draggedElement.style.left = `${touch.clientX - offsetX}px`;
    draggedElement.style.top = `${touch.clientY - offsetY}px`;
    draggedElement.style.width = `${rect.width}px`;
    draggedElement.style.height = `${rect.height}px`;
    draggedElement.style.zIndex = '1000';
}

function touchmove(e){
    if (!draggedElement) return;
    
    const touch = e.touches[0];
    // Centraliza a carta no dedo
    draggedElement.style.left = `${touch.clientX - offsetX}px`;
    draggedElement.style.top = `${touch.clientY - offsetY}px`;
}

function touchend(e){
    if (!draggedElement) return;
    
    draggedElement.style.position = '';
    draggedElement.style.left = '';
    draggedElement.style.top = '';
    draggedElement.style.width = '';
    draggedElement.style.height = '';
    draggedElement.style.zIndex = '';

    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (target) {
        const dropTarget = target.closest('.pilha, .pilha_fundacao, .carta-virada');

        if(dropTarget){
            const origem = parseInt(e.target.dataset.cartaId);

            validarMovimento(dropTarget, origem);
        }
    }
    draggedElement = null;
}

//Evento chamado ao iniciar o movimento de uma carta
function drag(e) {
    e.dataTransfer.setData("carta", e.target.id);
}

//Desabilita a funcao padrao ao movimentar uma carta
function allowDrop(e) {
    e.preventDefault();
}

//Evento chamado ao soltar uma carta sobre a outra
function drop(e) {
    const origem = parseInt(e.dataTransfer.getData("carta"));
    
    const targetElement = e.target.closest('.pilha, .pilha_fundacao, .carta-virada');
    
    if (!targetElement) return;
    
    validarMovimento(targetElement, origem);
    
}

function validarMovimento(targetElement, origem){
    const destino = targetElement.classList.contains('carta-virada') ? 
                   parseInt(targetElement.id) : 
                   -1;

    // Resto da lógica de validação e movimento das cartas
    if (isNaN(destino) || destino === -1) {
        // Lógica para pilhas vazias
        if (targetElement.classList.contains("pilha") && jogo.baralho[origem].carta === 13) {
            moverCarta(origem, targetElement);
        } else if (targetElement.classList.contains("pilha_fundacao") && jogo.baralho[origem].carta === 1) {
            moverCarta(origem, targetElement);
        }
    } else {
        // Lógica para cartas existentes
        const cartaDestino = jogo.baralho[destino];
        const cartaOrigem = jogo.baralho[origem];

        if (targetElement.closest('.pilha')) {
            if (cartaDestino.carta === cartaOrigem.carta + 1 && 
                cartaDestino.naipe.cor !== cartaOrigem.naipe.cor) {
                moverCarta(origem, targetElement);
            }
        } else if (targetElement.closest('.pilha_fundacao')) {
            if (cartaDestino.carta === cartaOrigem.carta - 1 && 
                cartaDestino.naipe.nome === cartaOrigem.naipe.nome) {
                moverCarta(origem, targetElement);
            }
        }
    }
}

function moverCarta(origem, targetElement) {
    const carta = document.getElementById(origem);
    
    // Atualiza as relações pai/filho
    if (jogo.baralho[origem].pai !== -1) {
        jogo.baralho[jogo.baralho[origem].pai].filho = -1;
        const elementoPai = document.getElementById(jogo.baralho[origem].pai);
        if (!elementoPai.classList.contains("carta-virada")) {
            jogo.virar_carta(jogo.baralho[origem].pai);
        }
    }

    // Remove do descarte se necessário
    if (carta.closest('.pilha_descarte')) {
        jogo.descarte.splice(-1, 1);
    }

    // Move a carta
    targetElement.appendChild(carta);

    jogo.verificarFimDeJogo();
}

function main(){
    // Adiciona eventos de drag and drop às pilhas de fundação
    for (let i = 1; i <= 4; i++) {
        const fundacao = document.getElementById(`fundacao${i}`);
        fundacao.draggable = false;
        fundacao.addEventListener('dragstart', drag, { passive: true });
        fundacao.addEventListener('dragover', allowDrop); 
        fundacao.addEventListener('drop', drop, { passive: true });
        fundacao.addEventListener('touchstart', touchstart, { passive: true });
        fundacao.addEventListener('touchmove', touchmove, { passive: true });
        fundacao.addEventListener('touchend', touchend, { passive: true });
    }

    document.querySelectorAll('.pilha').forEach(pilha => {
        pilha.draggable = false;
        pilha.addEventListener('dragstart', drag, { passive: true });
        pilha.addEventListener('dragover', allowDrop); 
        pilha.addEventListener('drop', drop, { passive: true });
        pilha.addEventListener('touchstart', touchstart, { passive: true });
        pilha.addEventListener('touchmove', touchmove, { passive: true });
        pilha.addEventListener('touchend', touchend, { passive: true });
    });

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