const fs = require('fs');

module.exports = {
    config: {
        name: "لعبة-الموت",
        version: "2.0",
        author: "حسين يعقوبي",
        role: 0,
        countdown: 15,
        category: "العاب",
        shortDescription: {
            ar: "لعبة جماعية مع القتل والمنافسة"
        },
        longDescription: {
            ar: "لعبة جماعية ممتعة مع قلوب ونظام طرد للاعبين، تتضمن عدة ألعاب مصغرة وتنتهي بلعبة XO بين آخر لاعبين"
        },
        guide: {
            ar: "{prefix}لعبة-الموت - ابدأ لعبة الموت الجماعية"
        }
    },

    onStart: async function ({ message, event, commandName, participants, api }) {
        // تحقق من عدد المشاركين
        const allParticipants = participants.map(p => p.userID);
        if (allParticipants.length < 3) {
            return message.reply("❌ | تحتاج إلى 3 أشخاص على الأقل لبدء اللعبة!");
        }

        // تهيئة اللعبة
        const gameData = {
            commandName,
            players: {},
            currentRound: 0,
            gameState: "playing",
            currentGame: null,
            lastWinner: null,
            gameStartTime: Date.now()
        };

        // تعيين 3 قلوب لكل لاعب
        allParticipants.forEach(player => {
            gameData.players[player] = {
                hearts: 3,
                name: "",
                score: 0
            };
        });

        // الحصول على أسماء اللاعبين
        try {
            const userInfos = await api.getUserInfo(allParticipants);
            for (const id in userInfos) {
                gameData.players[id].name = userInfos[id].name;
            }
        } catch (e) {
            console.error(e);
        }

        // بدء الجولة الأولى
        message.reply(`🎮 | بدأت لعبة الموت مع ${allParticipants.length} لاعبين!\n` +
                     `كل لاعب لديه 3 قلوب. الفائز في كل جولة يختار لاعبًا لقتله!\n\n` +
                     `✧━━━━━━━━━━━━━━━━━✧\n` +
                     `🛠️ | الأوامر المتاحة أثناء اللعبة:\n` +
                     `- "إنهاء": لإنهاء اللعبة\n` +
                     `- "الحالة": لعرض حالة اللعبة الحالية\n` +
                     `✧━━━━━━━━━━━━━━━━━✧`);

        startNewRound(message, gameData);
    },

    onReply: async ({ message, event, Reply, usersData, api, commandName, args }) => {
        const userInput = event.body.trim();
        const senderID = event.senderID;

        // معالجة الأوامر الخاصة
        if (userInput.toLowerCase() === "إنهاء") {
            if (Reply && Reply.gameData) {
                endGame(message, Reply.gameData, "تم إنهاء اللعبة بواسطة أحد اللاعبين");
            }
            return;
        }

        if (userInput.toLowerCase() === "الحالة") {
            if (Reply && Reply.gameData) {
                sendGameStatus(message, Reply.gameData);
            }
            return;
        }

        if (!Reply) return;

        const { gameData, correctAnswer, gameType, choosingKill } = Reply;

        // التحقق من أن اللعبة لا تزال جارية
        if (gameData.gameState !== "playing" && gameData.gameState !== "final") {
            return message.reply("❌ | اللعبة انتهت بالفعل!");
        }

        // معالجة اختيار القتل
        if (choosingKill && senderID === Reply.author) {
            handleKillChoice(message, event, gameData, userInput);
            return;
        }

        // معالجة لعبة XO
        if (gameData.gameState === "final" && gameData.xo) {
            handleXOMove(message, event, gameData, userInput);
            return;
        }

        // التحقق من أن اللاعب ما زال في اللعبة
        if (!gameData.players[senderID] || gameData.players[senderID].hearts <= 0) {
            return message.reply("❌ | لقد تم طردك من اللعبة أو انتهت حياتك!");
        }

        let isCorrect = false;
        let userAnswer = userInput;

        // التحقق من الإجابة حسب نوع اللعبة
        switch (gameType) {
            case "ايموجي":
                isCorrect = userAnswer === correctAnswer;
                break;
            case "اعلام":
            case "عاصمة":
                if (!isNaN(userAnswer)) {
                    const index = parseInt(userAnswer) - 1;
                    if (index >= 0 && index < Reply.options.length) {
                        userAnswer = Reply.options[index];
                    }
                }
                isCorrect = userAnswer === correctAnswer;
                break;
        }

        if (isCorrect) {
            // الفائز في الجولة
            gameData.lastWinner = senderID;
            gameData.players[senderID].score++;
            const remainingPlayers = getRemainingPlayers(gameData);
            
            // إذا بقي لاعبين فقط، ننتقل إلى لعبة XO
            if (remainingPlayers.length === 2) {
                gameData.gameState = "final";
                startXOGame(message, gameData);
                return;
            }

            message.reply(`🎉 | ${gameData.players[senderID].name} فاز بالجولة! (+1 نقطة)\n` +
                         `يمكنه الآن اختيار لاعب لقتله (إزالة قلب).\n\n` +
                         `اللاعبون المتبقون:\n${getPlayersList(gameData)}`);
            
            // انتظار اختيار اللاعب للقتل
            message.reply(`🗡️ | رد برقم اللاعب الذي تريد قتله:\n${getPlayersList(gameData, true)}\n\n` +
                         `أو اكتب "تخطي" لتخطي هذه الخطوة`, (err, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName,
                    messageID: info.messageID,
                    author: senderID,
                    gameData,
                    choosingKill: true
                });
            });
            
        } else {
            // إجابة خاطئة
            message.reply("❌ | إجابة خاطئة! حاول مرة أخرى في الجولة القادمة.");
        }
    }
};

// ============== الدوال المساعدة ============== //

function startNewRound(message, gameData) {
    gameData.currentRound++;
    const remainingPlayers = getRemainingPlayers(gameData);
    
    // التحقق من نهاية اللعبة
    if (remainingPlayers.length < 2) {
        endGame(message, gameData);
        return;
    }

    // اختيار لعبة عشوائية للجولة
    const games = ["ايموجي", "اعلام", "عاصمة"];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    gameData.currentGame = randomGame;

    let question, correctAnswer, options;
    
    switch (randomGame) {
        case "ايموجي":
            const emojis = JSON.parse(fs.readFileSync('emojie.json'));
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            question = `✧━━━━━━━━━━━━━━━━━✧\n🎮 | الجولة ${gameData.currentRound} (الإيموجي)\n` +
                      `ما هو الإيموجي الذي يتناسب مع الوصف التالي؟\n\n` +
                      `"${randomEmoji.description}"\n\n` +
                      `✧━━━━━━━━━━━━━━━━━✧`;
            correctAnswer = randomEmoji.emoji;
            break;
            
        case "اعلام":
            const flags = JSON.parse(fs.readFileSync('flags.json'));
            const randomFlag = flags[Math.floor(Math.random() * flags.length)];
            
            // توليد خيارين عشوائيين خاطئين
            let wrongOptions = [];
            while (wrongOptions.length < 2) {
                const random = flags[Math.floor(Math.random() * flags.length)];
                if (random.name !== randomFlag.name && !wrongOptions.includes(random.name)) {
                    wrongOptions.push(random.name);
                }
            }
            
            options = [randomFlag.name, ...wrongOptions].sort(() => Math.random() - 0.5);
            correctAnswer = randomFlag.name;
            
            question = `✧━━━━━━━━━━━━━━━━━✧\n🎮 | الجولة ${gameData.currentRound} (الأعلام)\n` +
                      `ما هو اسم العلم في الصورة؟\n\n` +
                      `${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\n` +
                      `✧━━━━━━━━━━━━━━━━━✧`;
            break;
            
        case "عاصمة":
            const capitals = JSON.parse(fs.readFileSync('capitals.json'));
            const randomCapital = capitals[Math.floor(Math.random() * capitals.length)];
            
            // توليد خيارين عشوائيين خاطئين
            let wrongCapitals = [];
            while (wrongCapitals.length < 2) {
                const random = capitals[Math.floor(Math.random() * capitals.length)];
                if (random.capital !== randomCapital.capital && !wrongCapitals.includes(random.capital)) {
                    wrongCapitals.push(random.capital);
                }
            }
            
            options = [randomCapital.capital, ...wrongCapitals].sort(() => Math.random() - 0.5);
            correctAnswer = randomCapital.capital;
            
            question = `✧━━━━━━━━━━━━━━━━━✧\n🎮 | الجولة ${gameData.currentRound} (العواصم)\n` +
                      `ما هي عاصمة ${randomCapital.country}؟\n\n` +
                      `${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\n` +
                      `✧━━━━━━━━━━━━━━━━━✧`;
            break;
    }
    
    // إرسال السؤال
    message.reply(question, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
            commandName: "لعبة-الموت",
            messageID: info.messageID,
            gameData,
            correctAnswer,
            gameType: randomGame,
            options: options || null
        });
    });
}

function handleKillChoice(message, event, gameData, userInput) {
    const remainingPlayers = getRemainingPlayers(gameData);
    
    if (userInput.toLowerCase() === "تخطي") {
        message.reply("✅ | تم تخطي خطوة القتل. ننتقل إلى الجولة التالية!");
        return startNewRound(message, gameData);
    }

    const choice = parseInt(userInput);
    if (isNaN(choice) || choice < 1 || choice > remainingPlayers.length) {
        return message.reply("❌ | رجاءً أدخل رقمًا صحيحًا من القائمة!");
    }

    const targetID = remainingPlayers[choice - 1];
    gameData.players[targetID].hearts--;
    
    message.reply(`💔 | ${gameData.players[targetID].name} فقد قلبًا! (باقي له ${gameData.players[targetID].hearts} قلوب)`);
    
    // التحقق إذا تم طرد اللاعب
    if (gameData.players[targetID].hearts <= 0) {
        message.reply(`☠️ | ${gameData.players[targetID].name} تم طرده من اللعبة!`);
    }
    
    // الانتقال إلى الجولة التالية
    startNewRound(message, gameData);
}

function startXOGame(message, gameData) {
    const remainingPlayers = getRemainingPlayers(gameData);
    const [player1, player2] = remainingPlayers;
    
    const board = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
    ];
    
    gameData.xo = {
        board,
        currentPlayer: player1,
        players: [player1, player2],
        symbols: { [player1]: '❌', [player2]: '⭕' }
    };
    
    message.reply(`✧━━━━━━━━━━━━━━━━━✧\n🎮 | الوصول إلى النهائي!\n` +
                 `${gameData.players[player1].name} (❌) ضد ${gameData.players[player2].name} (⭕)\n\n` +
                 `لوحة اللعب:\n${drawXOBorad(gameData.xo.board)}\n\n` +
                 `دور ${gameData.players[player1].name} (❌) - أرسل رقم الصف والعمود (مثال: 1 2)`);
}

function handleXOMove(message, event, gameData, userInput) {
    const xoData = gameData.xo;
    const playerID = event.senderID;
    
    // التحقق من أن هذا هو دور اللاعب
    if (playerID !== xoData.currentPlayer) {
        return message.reply("❌ | ليس دورك للعب الآن!");
    }
    
    // تحقق من صحة الإدخال
    const move = userInput.split(' ').map(Number);
    if (move.length !== 2 || isNaN(move[0]) || isNaN(move[1]) || 
        move[0] < 1 || move[0] > 3 || move[1] < 1 || move[1] > 3) {
        return message.reply("❌ | أدخل رقم الصف والعمود بشكل صحيح (مثال: 1 2)");
    }
    
    const row = move[0] - 1;
    const col = move[1] - 1;
    
    // التحقق من أن الخلية فارغة
    if (xoData.board[row][col] !== ' ') {
        return message.reply("❌ | هذه الخلية محجوزة بالفعل!");
    }
    
    // تطبيق الحركة
    xoData.board[row][col] = xoData.symbols[playerID];
    
    // التحقق من الفوز
    if (checkXOWin(xoData.board, xoData.symbols[playerID])) {
        gameData.players[playerID].score += 3;
        endGame(message, gameData, `${gameData.players[playerID].name} فاز بلعبة XO واللعبة كاملة!`);
        return;
    }
    
    // التحقق من التعادل
    if (checkXODraw(xoData.board)) {
        message.reply("🤝 | تعادل في لعبة XO! كل لاعب يحصل على نقطة واحدة.");
        gameData.players[xoData.players[0]].score++;
        gameData.players[xoData.players[1]].score++;
        endGame(message, gameData);
        return;
    }
    
    // تغيير الدور
    xoData.currentPlayer = xoData.players.find(p => p !== playerID);
    
    // إرسال اللوحة المحدثة
    message.reply(`✅ | حركة ناجحة!\n\n` +
                 `لوحة اللعب:\n${drawXOBorad(xoData.board)}\n\n` +
                 `دور ${gameData.players[xoData.currentPlayer].name} (${xoData.symbols[xoData.currentPlayer]})`);
}

function endGame(message, gameData, customMessage = null) {
    gameData.gameState = "ended";
    const duration = Math.floor((Date.now() - gameData.gameStartTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    const remainingPlayers = getRemainingPlayers(gameData);
    const sortedPlayers = Object.keys(gameData.players)
        .map(id => ({
            id,
            name: gameData.players[id].name,
            score: gameData.players[id].score,
            hearts: gameData.players[id].hearts
        }))
        .sort((a, b) => b.score - a.score);
    
    let resultMessage = customMessage || `🏁 | انتهت لعبة الموت بعد ${minutes} دقائق و${seconds} ثانية!\n\n` +
                      `🎖️ | النتائج النهائية:\n\n`;
    
    sortedPlayers.forEach((player, index) => {
        const rank = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '▫️';
        resultMessage += `${rank} | ${player.name}: ${player.score} نقطة (${player.hearts} قلوب)\n`;
    });
    
    if (remainingPlayers.length === 1) {
        resultMessage += `\n🎉 | ${gameData.players[remainingPlayers[0]].name} هو البطل النهائي!`;
    }
    
    message.reply(resultMessage);
}

function sendGameStatus(message, gameData) {
    const remainingPlayers = getRemainingPlayers(gameData);
    const duration = Math.floor((Date.now() - gameData.gameStartTime) / 1000);
    
    let statusMessage = `📊 | حالة اللعبة الحالية:\n\n` +
                       `⏱️ | المدة: ${duration} ثانية\n` +
                       `🎮 | الجولة: ${gameData.currentRound}\n` +
                       `🕹️ | اللعبة الحالية: ${gameData.currentGame || 'لم تبدأ بعد'}\n\n` +
                       `👥 | اللاعبون المتبقون (${remainingPlayers.length}):\n` +
                       `${getPlayersList(gameData)}\n\n` +
                       `🏆 | المتصدرون:\n`;
    
    const sortedPlayers = Object.keys(gameData.players)
        .filter(id => gameData.players[id].hearts > 0)
        .map(id => ({
            name: gameData.players[id].name,
            score: gameData.players[id].score
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    
    sortedPlayers.forEach((player, index) => {
        const rank = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        statusMessage += `${rank} ${player.name}: ${player.score} نقطة\n`;
    });
    
    message.reply(statusMessage);
}

function getRemainingPlayers(gameData) {
    return Object.keys(gameData.players).filter(id => gameData.players[id].hearts > 0);
}

function getPlayersList(gameData, withNumbers = false) {
    const players = getRemainingPlayers(gameData);
    
    if (withNumbers) {
        return players.map((id, index) => `${index + 1}. ${gameData.players[id].name} (${gameData.players[id].hearts} قلوب)`).join('\n');
    } else {
        return players.map(id => `- ${gameData.players[id].name} (${gameData.players[id].hearts} قلوب)`).join('\n');
    }
}

function drawXOBorad(board) {
    return board.map(row => row.join(' │ ')).join('\n───┼───┼───\n');
}

function checkXOWin(board, symbol) {
    // التحقق من الصفوف
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === symbol && board[i][1] === symbol && board[i][2] === symbol) {
            return true;
        }
    }
    
    // التحقق من الأعمدة
    for (let j = 0; j < 3; j++) {
        if (board[0][j] === symbol && board[1][j] === symbol && board[2][j] === symbol) {
            return true;
        }
    }
    
    // التحقق من القطرين
    if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) {
        return true;
    }
    
    if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) {
        return true;
    }
    
    return false;
}

function checkXODraw(board) {
    return board.flat().every(cell => cell !== ' ');
    }
