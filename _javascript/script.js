// ============ LÓGICA DE OBSTÁCULOS (CANO/ÁRVORE) E FASE SHEREK ============
let isSherekPhase = false;
let nextObstacleIsTree = false;
let arvoreDesbloqueada = false;
let tree = null;

function resetObstaculos() {
    pipe.style.display = 'block';
    pipe.style.left = '';
    pipe.style.animation = 'pipe-animation var(--velocidade) infinite linear';
    if (tree) {
        tree.style.display = 'none';
        tree.style.left = '100%';
        tree.style.animation = 'pipe-animation var(--velocidade) infinite linear';
    }
    nextObstacleIsTree = false;
}

function loopObstaculos() {
    if (!tree) return; // Aguarda tree ser criado
    
    // Posição dos obstáculos
    const pipePosition = pipe.offsetLeft;
    const treePosition = tree.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    
    // Debug a cada 2 segundos (aproximadamente)
    if (Math.random() < 0.005) {
        console.log('🔍 Debug - Cano pos:', pipePosition, 'Árvore pos:', treePosition, 'Próximo é árvore:', nextObstacleIsTree);
        console.log('📊 Estados - Cano display:', pipe.style.display, 'Árvore display:', tree.style.display);
    }

    if (!isSherekPhase) {
        // Fase normal: alterna entre cano e árvore (sequencial)
        if (nextObstacleIsTree) {
            // Mostra árvore
            pipe.style.display = 'none';
            tree.style.display = 'block';
            
            // Reposiciona árvore quando sai da tela e alterna para cano
            if (treePosition <= -80) {
                console.log('🌳 Árvore saiu da tela, alternando para cano');
                nextObstacleIsTree = false;
                tree.style.display = 'none';
                pipe.style.left = '';
                pipe.style.display = 'block';
                pipe.style.animation = 'pipe-animation var(--velocidade) infinite linear';
            }
        } else {
            // Mostra cano
            tree.style.display = 'none';
            pipe.style.display = 'block';
            
            // Reposiciona cano quando sai da tela e alterna para árvore
            if (pipePosition <= -80) {
                console.log('🔧 Cano saiu da tela, alternando para árvore');
                nextObstacleIsTree = true;
                pipe.style.display = 'none';
                tree.style.left = '';
                tree.style.display = 'block';
                tree.style.animation = 'pipe-animation var(--velocidade) infinite linear';
            }
        }
    } else {
        // Fase Sherek: só árvores
        pipe.style.display = 'none';
        tree.style.display = 'block';
        if (treePosition < 50) { // Mudando de -80 para 50
            tree.style.left = '';
            tree.style.animation = 'pipe-animation var(--velocidade) infinite linear';
        }
    }

    // Colisão com cano (quando cano está visível)
    if (!isSherekPhase && !colisaoDetectada && !estaInvuneravel && 
        pipe.style.display === 'block' && pipePosition <= 120 && pipePosition > 0 && marioPosition <= 30) {
        
        console.log('💥 Colidiu com CANO! Mario altura:', marioPosition, 'Vidas atuais:', vida);
        colisaoDetectada = true;
        pausa = true;
        
        // Para o cano
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;
        
        // Reduz vida primeiro
        vida--;
        atualizarVidas();
        console.log(`Perdeu uma vida! Vidas restantes: ${vida}`);
        
        if (vida > 0) {
            // Ainda tem vidas: mostra tela de continuar
            jogarDenovoScreen.style.display = 'flex';
        } else {
            // Última vida: morre
            console.log('Última vida perdida - Game Over!');
            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;
            mario.src = localGameOver;
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';
            gameOverScreen.style.display = 'flex';
            clearInterval(loop);
            clearInterval(scoreInterval);
            finalScoreElement.textContent = score;
            musicaMario.pause();
            salvarPontuacao(playerNick, score);
        }
    }

    // Colisão com árvore (quando árvore está visível)
    if (!colisaoDetectada && tree.style.display === 'block' && 
        treePosition <= 120 && treePosition > 0 && marioPosition <= 30) {
        
        if (!isSherekPhase && !arvoreDesbloqueada) {
            // PRIMEIRA VEZ: Exibe tela de encantamento
            console.log('🌟 Colidiu com ÁRVORE - abrindo tela de encantamento! Mario altura:', marioPosition);
            tree.style.animation = 'none';
            tree.style.left = `${treePosition}px`;
            clearInterval(loop);
            clearInterval(scoreInterval);
            document.getElementById('encantamento-screen').style.display = 'flex';
            arvoreDesbloqueada = true;
            return;
        } else if (!isSherekPhase && arvoreDesbloqueada) {
            // ÁRVORE NORMAL: Colisão igual ao cano
            console.log('💥 Colidiu com ÁRVORE normal! Mario altura:', marioPosition, 'Vidas atuais:', vida);
            colisaoDetectada = true;
            pausa = true;
            
            // Para a árvore
            tree.style.animation = 'none';
            tree.style.left = `${treePosition}px`;
            
            // Reduz vida
            vida--;
            atualizarVidas();
            console.log(`Perdeu uma vida na árvore! Vidas restantes: ${vida}`);
            
            if (vida > 0) {
                jogarDenovoScreen.style.display = 'flex';
            } else {
                console.log('Última vida perdida na árvore - Game Over!');
                mario.style.animation = 'none';
                mario.style.bottom = `${marioPosition}px`;
                mario.src = localGameOver;
                mario.style.width = '75px';
                mario.style.marginLeft = '50px';
                gameOverScreen.style.display = 'flex';
                clearInterval(loop);
                clearInterval(scoreInterval);
                finalScoreElement.textContent = score;
                musicaMario.pause();
                salvarPontuacao(playerNick, score);
            }
            return;
        } else if (isSherekPhase) {
            // FASE SHEREK: colisão com árvore mata
            console.log('Colidiu com árvore na fase Sherek - morrendo! Mario altura:', marioPosition);
            tree.style.animation = 'none';
            tree.style.left = `${treePosition}px`;
            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;
            mario.src = localGameOver;
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';
            gameOverScreen.style.display = 'flex';
            clearInterval(loop);
            clearInterval(scoreInterval);
            finalScoreElement.textContent = score;
            musicaMario.pause();
            salvarPontuacao(playerNick, score);
        }
    }
}

// Função para seleção de personagem especial
window.escolherPersonagemEspecial = function(personagem) {
    console.log('🧙‍♂️ Personagem especial selecionado:', personagem);
    
    let gif = '';
    if (personagem === 'burro_sherek') gif = '_media/burro_sherek.gif';
    if (personagem === 'gato_de_botas') gif = '_media/gato_de_botas.gif';
    if (personagem === 'shrek') gif = '_media/shrek.gif';
    
    mario.src = gif;
    console.log('🎭 Personagem trocado para:', gif);
    
    // Troca o fundo do game-board para o cenário Sherek
    gameBoard.style.backgroundImage = "url('_imagens/cenario_sherek.svg')";
    gameBoard.style.backgroundSize = 'cover';
    gameBoard.style.backgroundPosition = 'center';
    
    // IMPORTANTE: Configura fase Shrek mas reseta flags de colisão
    isSherekPhase = true;
    arvoreDesbloqueada = true; // Marca que já desbloqueou
    colisaoDetectada = false;  // Reseta colisão para não matar direto
    pausa = false;
    
    console.log('🌟 Entrando na fase Shrek - pontos preservados:', score);
    
    // Esconde tela de encantamento
    document.getElementById('encantamento-screen').style.display = 'none';
    
    // Reseta obstáculos para a fase Shrek
    pipe.style.display = 'none';
    tree.style.display = 'block';
    tree.style.left = '';
    tree.style.animation = 'pipe-animation var(--velocidade) infinite linear';
    
    // Reinicia loops
    if (loop) clearInterval(loop);
    if (scoreInterval) clearInterval(scoreInterval);
    
    loop = setInterval(loopObstaculos, 10);
    scoreInterval = setInterval(() => {
        if (!pausa) score++;
        scoreElement.textContent = `Score: ${score}`;
    }, 100);
    
    // Ativa invunerabilidade de 1 segundo na transição
    ativarInvunerabilidade();
    setTimeout(() => {
        ativarInvunerabilidade(); // Dupla proteção
    }, 800);
}
/* =========================================
   SELEÇÃO DE ELEMENTOS DO JOGO (DOM)
   =========================================
   Aqui, guardamos em constantes as referências
   aos elementos HTML que serão manipulados
   durante o jogo, como o personagem, obstáculos e telas.
*/
const mario = document.querySelector(".mario");
const pipe = document.querySelector(".pipe");
const scoreElement = document.querySelector('.score');
const livesContainer = document.querySelector('#lives-container');
const bullet = document.querySelector('.bullet');
const gameOverScreen = document.querySelector('.game-over-screen');
const jogarDenovoScreen = document.querySelector('.tela-jogar-denovo');
const finalScoreElement = document.querySelector('#final-score');
const gameBoard = document.querySelector('.game-board');
const root = document.documentElement;
const clouds = document.querySelector('.clouds');
const starLayer = document.querySelector('#star-layer');
const infernoBackground = document.querySelector("#inferno-background");
const spriteMorteTemporario = './_media/napstablookMorte.gif';
const passioneScreen = document.querySelector('#passioneScreen');

/* =========================================
   ELEMENTOS DA TELA INICIAL
   =========================================
   Referências aos elementos da primeira tela
   que o jogador vê, onde ele insere o nickname.
*/
const telaInicial = document.querySelector('.tela-Inicial');
const nicknameInput = document.querySelector('#nickname');
const startButton = document.querySelector('#start-button');

/* =========================================
   RECURSOS DE ÁUDIO E IMAGENS PADRÃO
   =========================================
   Pré-carregamento dos arquivos de áudio e
   definição de imagens padrão para o jogo.
*/
var musicaMario = new Audio('./_media/_sons/trilhasonoramario.mp3');
const jumpSound = new Audio('./_media/_sons/jump.mp3');
const selectSound = new Audio('./_media/_sons/undertale-select.mp3');
const coinSound = new Audio('./_media/_sons/coin-audio.mp3');
var localGameOver = './_imagens/morte/game-over-mario.png';

/* =========================================
   VARIÁVEIS DE ESTADO DO JOGO
   =========================================
   Variáveis que controlam o estado atual do
   jogo, como pontuação, vidas, pausa, etc.
*/
let pausa = false;
let estaInvuneravel = false;
let colisaoDetectada = false; // Evita múltiplas colisões
var vida = 3;
let score = 0;
let moedasColetadas = 0;
let playerNick = '';
let loop;
let scoreInterval;
let personagemSelecionadoId = 'marioDiv';

/* =========================================
   FLAGS DE CONTROLE DE TEMA
   =========================================
   Variáveis booleanas para garantir que as
   mudanças de tema (tarde, noite, inferno)
   aconteçam apenas uma vez.
*/
let tardeAtivada = false;
let noiteAtivada = false;
let infernoAtivado = false;
function startGame() {
    console.log('startGame() foi chamado!');
    telaInicial.style.display = 'none';
    pipe.style.animationPlayState = 'running';
    root.style.setProperty('--velocidade', `2.0s`);
    atualizarVidas();
    // Cria árvore só quando o jogo começa
    if (!tree) {
        tree = document.createElement('img');
        tree.src = './_imagens/pipe_sherek.png';
        tree.className = 'pipe'; // Usa mesma classe CSS do cano
        tree.id = 'tree'; // ID único para identificar
        tree.style.display = 'none';
        gameBoard.appendChild(tree);
        console.log('Árvore criada:', tree);
        console.log('Caminho da imagem:', tree.src);
        console.log('Árvore adicionada ao gameBoard');
        
        // Verificar se a imagem carregou
        tree.onload = function() {
            console.log('✅ Imagem da árvore carregou com sucesso!');
        };
        tree.onerror = function() {
            console.log('❌ Erro ao carregar imagem da árvore!');
        };
    }
    resetObstaculos();

    scoreInterval = setInterval(() => {
        if (!pausa) score++;
        scoreElement.textContent = `Score: ${score}`;

        // AUMENTO PROGRESSIVO DE VELOCIDADE
        if (score % 1 === 0 && score > 0 && !infernoAtivado && !pausa) {
            let velocidadeAtual = parseFloat(getComputedStyle(root).getPropertyValue('--velocidade'));
            if (velocidadeAtual > 1.5) {
                let novaVelocidade = Math.max(1.5, velocidadeAtual - 0.001);
                root.style.setProperty('--velocidade', `${novaVelocidade.toFixed(3)}s`);
            }
        }

        // MUDANÇAS DE TEMA
        if (score >= 500 && !tardeAtivada) {
            gameBoard.className = 'game-board theme-tarde';
            starLayer.style.display = 'block';
            musicaMario.pause();
            musicaMario = new Audio('./_media/_sons/HoraDeAventura.mp3');
            musicaMario.play();
            tardeAtivada = true;
        }
        if (score >= 1000 && !noiteAtivada) {
            gameBoard.className = 'game-board theme-noite';
            starLayer.style.display = 'block';
            musicaMario.pause();
            musicaMario = new Audio('./_media/_sons/silkSong.mp3');
            musicaMario.play();
            noiteAtivada = true;
        }
        if (score >= 1500 && !infernoAtivado) {
            gameBoard.className = 'game-board theme-infernal';
            infernoBackground.style.display = 'block';
            starLayer.style.display = 'none';
            musicaMario.pause();
            musicaMario = new Audio('./_media/_sons/DoomEternal.mp3');
            musicaMario.play();
            infernoAtivado = true;
        }
    }, 100);

    loop = setInterval(loopObstaculos, 10);
}

/* =========================================
   FUNÇÕES PRINCIPAIS DE JOGABILIDADE
   =========================================
   Funções que controlam as ações básicas
   do jogador e do jogo.
*/

/**
 * Função de pulo do personagem - simplificada
 */
const jump = () => {
    // Não pula se estiver em game over, menu, ou já pulando
    if (gameOverScreen.style.display === 'flex' || 
        jogarDenovoScreen.style.display === 'flex' || 
        mario.classList.contains('jump')) {
        return;
    }
    
    mario.classList.add('jump');
    jumpSound.currentTime = 0;
    jumpSound.play();
    
    setTimeout(() => {
        mario.classList.remove('jump');
    }, 600);
}

/**
 * Atualiza a exibição de vidas na tela
 */
function atualizarVidas() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < vida; i++) {
        const lifeIcon = document.createElement('img');
        lifeIcon.src = './_media/life.gif';
        lifeIcon.classList.add('life-icon');
        livesContainer.appendChild(lifeIcon);
    }
}

/**
 * Chamada quando o jogador colide com um obstáculo.
 * Reduz uma vida, atualiza a tela e, se houver
 * vidas restantes, mostra o sprite de morte temporária.
 */
function perdeVida() {
    vida--;
    atualizarVidas();

    if (vida >= 0) {
        mario.src = spriteMorteTemporario;
    }
}

/**
 * Ativa um curto período de invulnerabilidade
 * após o jogador perder uma vida e continuar.
 */
function ativarInvunerabilidade() {
    estaInvuneravel = true;
    colisaoDetectada = false; // Reseta flag de colisão durante invunerabilidade
    mario.classList.add('invuneravel');
    console.log('🛡️ Invunerabilidade ativada por 700ms');
    setTimeout(() => {
        estaInvuneravel = false;
        mario.classList.remove('invuneravel');
        console.log('🛡️ Invunerabilidade desativada');
    }, 700); // Mudado de 2000ms para 700ms
}

/**
 * Envia a pontuação final para o servidor via PHP.
 */
function salvarPontuacao(nomeJogador, pontuacaoFinal) {
    const dados = { name: nomeJogador, score: pontuacaoFinal };
    fetch('./_php/salvar_pontuacao.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
    })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => console.log('Resposta do PHP:', data.message))
        .catch((error) => console.error('Ocorreu um erro na comunicação:', error));
}

/* =========================================
   SISTEMA DE CÓDIGOS SECRETOS (EASTER EGGS)
   =========================================
   Lógica para detectar sequências de teclas
   e ativar efeitos especiais no jogo.
*/
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const robertoCode = ['r', 'o', 'b', 'e', 'r', 't', 'o'];
const palmeirasCode = ['p', 'a', 'l', 'm', 'e', 'i', 'r', 'a', 's'];
const sonicCode = ['s', 'o', 'n', 'i', 'c'];

function checarCodigo(sequencia, evento) {
    let position = 0;
    return function (key) {
        if (key === sequencia[position]) {
            position++;
            if (position === sequencia.length) {
                evento();
                position = 0;
            }
        } else {
            position = (key === sequencia[0]) ? 1 : 0;
        }
    }
}

const checkKonami = checarCodigo(konamiCode, () => {
    mario.src = './_media/wario.gif';
    mario.style.transform = 'scaleX(-1)';
});
const checkRoberto = checarCodigo(robertoCode, () => {
    mario.src = './_imagens/image.png';
    mario.style.transform = 'scaleX(1)';
});
const checkPalmeiras = checarCodigo(palmeirasCode, () => {
    mario.src = './_imagens/matheus.png';
    mario.style.transform = 'scaleX(1)';
});
const checkSonic = checarCodigo(sonicCode, () => {
    mario.src = './_media/sonic.gif';
    mario.style.transform = 'scaleX(1)';
});

/* =========================================
   FUNÇÕES DE EFEITOS VISUAIS
   =========================================
   Funções que criam elementos dinâmicos para
   melhorar a estética do jogo.
*/
function criarBrasa() {
    const ember = document.createElement('div');
    ember.classList.add('ember');
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.animationDelay = `${Math.random() * 3}s`;
    gameBoard.appendChild(ember);
}

/* =========================================
   FUNÇÃO PRINCIPAL DO JOGO (STARTGAME)
   =========================================
   Esta é a função central que controla todo o
   fluxo do jogo, iniciando os loops de
   pontuação e de colisão.
   
   NOTA: A função startGame() principal está 
   definida mais acima com a lógica da árvore.
*/

/* =========================================
   EVENT LISTENERS (OUVINTES DE EVENTOS)
   =========================================
   Código que "escuta" ações do usuário,
   como pressionar teclas ou clicar em botões.
*/
document.addEventListener('keydown', (event) => {
    // Teclas de pulo: Space, W, Arrow Up
    if (event.code === 'Space' || event.code === 'KeyW' || event.code === 'ArrowUp') {
        event.preventDefault();
        jump();
    }
    
    // Outras funções de teclas especiais
    checkKonami(event.key);
    checkRoberto(event.key);
    checkPalmeiras(event.key);
    checkSonic(event.key);
});

startButton.addEventListener('click', () => {
    const nick = nicknameInput.value.trim();
    if (nick) {
        playerNick = nick;
        startGame();
    } else {
        alert('Por favor, digite um nick para começar!');
    }
});

/* =========================================
   FUNÇÕES DE LÓGICA DE MENU E ESTADO
   =========================================
   Funções que gerenciam a seleção de
   personagens, a tela de "continuar" e o
   estado final de "Game Over".
*/
function escolhaPersonagem(personagem) {
    selectSound.currentTime = 0;
    selectSound.play();

    if (personagemSelecionadoId) {
        document.getElementById(personagemSelecionadoId).classList.remove('selecionado');
    }

    const novaSelecaoDiv = document.getElementById(`${personagem}Div`);
    if (novaSelecaoDiv) {
        novaSelecaoDiv.classList.add('selecionado');
        personagemSelecionadoId = `${personagem}Div`;
    }

    let marioGifPath = './_media/mario.gif';
    let gameOverImagePath = `./_imagens/morte/game-over-mario.png`;
    let mudarDirecao = false;

    switch (personagem) {
        case 'mario':
            marioGifPath = './_media/mario.gif';
            gameOverImagePath = `./_imagens/morte/game-over-mario.png`;
            break;
        case 'sonic':
            marioGifPath = './_media/sonic.gif';
            gameOverImagePath = `./_imagens/morte/game-over-sonic.png`;
            break;
        case 'megaman':
            marioGifPath = './_media/yd6sCid.gif';
            gameOverImagePath = `./_imagens/morte/game-over-megaman.png`;
            break;
        case 'link':
            marioGifPath = './_media/link.gif';
            gameOverImagePath = `./_imagens/morte/game-over-link.png`;
            break;
        case 'goku':
            marioGifPath = './_media/goku.gif';
            gameOverImagePath = `./_imagens/morte/game-over-goku.png`;
            break;
        case 'jotaro':
            marioGifPath = './_media/jotaroA.gif';
            gameOverImagePath = `./_imagens/morte/game-over-jotaro.gif`;
            break;
        case 'hollow':
            marioGifPath = './_media/hollow.gif';
            gameOverImagePath = `./_imagens/morte/game-over-hollow.png`;
            mudarDirecao = true;
            break;
        case 'hornet':
            marioGifPath = './_media/hornet.gif';
            gameOverImagePath = `./_imagens/morte/game-over-hornet.png`;
            mudarDirecao = true;
            break;
        default:
            console.warn(`Personagem '${personagem}' não reconhecido. Usando Mario padrão.`);
            break;
    }

    mario.src = marioGifPath;
    localGameOver = gameOverImagePath;
    mario.style.transform = mudarDirecao ? 'scaleX(-1)' : 'scaleX(1)';
}

function continuarReniciar(escolha) {
    if (escolha === 'continuar') {
        console.log('Continuando o jogo...');
        jogarDenovoScreen.style.display = 'none';
        
        // Reseta o obstáculo atual e continua a sequência
        if (nextObstacleIsTree) {
            // Estava na árvore, reinicia árvore
            tree.style.left = '';
            tree.style.animation = 'pipe-animation var(--velocidade) infinite linear';
            tree.style.display = 'block';
            pipe.style.display = 'none';
        } else {
            // Estava no cano, reinicia cano  
            pipe.style.left = '';
            pipe.style.animation = 'pipe-animation var(--velocidade) infinite linear';
            pipe.style.display = 'block';
            tree.style.display = 'none';
        }
        
        // Reseta flags
        colisaoDetectada = false;
        pausa = false;
        // Mantém o próximo obstáculo conforme está (não reseta a alternância)
        
        console.log('🔄 Continuando com próximo obstáculo:', nextObstacleIsTree ? 'árvore' : 'cano');
        
        // Reinicia o loop se não estiver rodando
        if (!loop) {
            loop = setInterval(loopObstaculos, 10);
        }
        
        // Ativa invunerabilidade temporária
        ativarInvunerabilidade();

    } else if (escolha === 'Reniciar') {
        window.location.reload();
    }
}

function morrer(pipePosition, bulletPosition, marioPosition) {
    pipe.style.animation = "none";
    pipe.style.left = `${pipePosition}px`;
    bullet.style.animation = "none";
    bullet.style.left = `${bulletPosition}px`;
    mario.style.animation = "none";
    mario.style.bottom = `${marioPosition}px`;
    mario.src = localGameOver;
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';
    gameOverScreen.style.display = 'flex';
    clearInterval(loop);
    clearInterval(scoreInterval);
    finalScoreElement.textContent = score;
    musicaMario.pause();
    salvarPontuacao(playerNick, score);
}

function criarMoeda(bottom) {
    const novaMoeda = document.createElement('img');
    novaMoeda.src = './_imagens/coin.png';
    novaMoeda.classList.add('coin');
    novaMoeda.style.bottom = `${bottom}px`;
    gameBoard.appendChild(novaMoeda);

    setTimeout(() => {
        if (novaMoeda) {
            novaMoeda.remove();
        }
    }, 4000);
}

/* =========================================
   INICIALIZAÇÃO DA PÁGINA
   =========================================
   Código que executa assim que a página é
   carregada, como a tela de startup.
*/
document.addEventListener('DOMContentLoaded', () => {
    const marioDiv = document.getElementById('marioDiv');
    if (marioDiv) {
        marioDiv.classList.add('selecionado');
    }

    // Adiciona evento de clique para seleção de personagem na tela inicial
    const personagens = ['mario', 'sonic', 'megaman', 'goku', 'link', 'jotaro', 'hollow', 'hornet'];
    personagens.forEach(p => {
        const div = document.getElementById(p + 'Div');
        if (div) {
            div.addEventListener('click', () => escolhaPersonagem(p));
        }
    });

    // Garante que a tela inicial aparece por padrão
    telaInicial.style.display = 'flex';
});