* Em troca de ativos depositos em um vault ERC4626, o usuário recebe ações. Essas ações podem posteriormente queimadas para regastar os ativos subjacentes correspondentes. O número de ações de um usuário irá depender da quantidade de quantidade depositada e da taxa de câmbio do vault, que por sua vez é definida pela liquidez atual.
    -> Ações = Taxa x Ativos_total
    -> Log(Ações) = Log(Taxa) + Log(Ativos_total) (A visualização das taxas se torna apenas a compensação no eixo        x das linhas )
* A favor do vault, o número de ações que um usuário recebe é arredondado em direção a zero. Quanto menor for o aporte, mais será a perda de ações. Simetricamente, quanto menor a taxa de câmbio, maior será a perda para um dado aporte. Quanto maior a taxa de câmbio, mais seguro será considerado o vault.
    -> Inflation Attack: A ideia é que o atacante pode doar ativos para o vault movendo a curva para a direita, diminuindo a taxa e tornando o vault inseguro.
        A situação que se cria é que aportes antes que dariam um certo número de ações, agora premiarão menos, e ddevido ao arrendondamento, significarão perdas ainda maiores de ações, podendo chegar a um ponto onde um usuário perca 100% do depósito para o vault, tornando o atacante único acionista, desembolsando seu depósito + depósitos perdidos de outros usuários.
        Dada um vault segurando um valor A0 de ativos com taxa de 1. Supondo que seja a1 o número de ativos que o atacante deposita, o número de ações que a vítima irá receber ao realizar um depósito u, será:
        shares = u . (A0 / A0 + a1), para que esse número seja menor que 1 (ou seja, para que a vítima receba 0 shares e perca todo seu depósito) => shares < 1 => u < 1 + (a1/A0) Supondo A0 = 1, o atacante precisaria depositar u-1 
        Extendendo o raciocínio para a situação que o atacante deseja que a vítima receba apenas uma fração das ações que receberia, a conclusão é que o investimento para o ataque se torna menor.
        O ataque consiste em básicamente inflar artificialmente o denominador da divisão, com um depósito de ativos a1 que não se converte em shares (ex: transferência direta de tokens para o contrato), criando essa distorção.

* Defesa com um Offset Virtual, consiste em duas partes:
    1) Usa-se um offset entre a precisão de ativos e ações. Utilizando mais casas decimais para representar as ações do que o token subjacente para representar os ativos.
    2) Inclusão de ações e ativos virtuais na computação cambial, forçando a taxa de conversão ser diferente de 1 para quando o cofre está vazio.
    -> Com isso o atacante agora tem que ligar com as a perdas ligadas ao ativos virtuais que irão diluir o seu ganho na ordem de (1 / ativos_virtuais + depósito_atacante), o que ainda é potencializado quanto maior o offset, gerando perdas maiores que o irá roubar do usuário: perdas >= u * 10^offset.
    
-----------------------------||-------------------------------------------||--------------------------------------

* A tokenização de cofres representa um problema significativo para desenvolvedores. A dificuldade está na integração de tokens de vários protocolos, exigindo pesquisa de cada protocolo, seus modelos de rendimento, compreensão os smart-contracts para que sejam verificadas todas as lacunas possíveis para a manutenção da seguração do vault.
    -> O ERC-4626 ( Tokenized Vault Standard ) é um protocolo que permite criar vaults tokenizados que representam ações de rendimento. Oferece uma API para compartilhamentos de um único token ERC-20. 
        -> Depósitos e Resgates / Taxas de conversão / Saldos / Interfaces / Eventos
