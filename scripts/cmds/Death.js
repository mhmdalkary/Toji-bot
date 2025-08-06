const fs = require('fs');

module.exports = {
    config: {
        name: "لعبة-الموت",
        version: "3.1",
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

    onStart: async function ({ message, event, participants, api }) {
        try {
            // التحقق من وجود مشاركين
            if (!participants || !Array.isArray(participants)) {
                return message.reply("❌ | لا يوجد مشاركين في المجموعة!");
            }

            // تحضير قائمة اللاعبين
            const allParticipants = participants.map(p => p.userID).filter(id => id);
            
            // التحقق من عدد المشاركين (3 أشخاص على الأقل)
            if (allParticipants.length < 3) {
                return message.reply("❌ | تحتاج إلى 3 أشخاص على الأقل لبدء اللعبة!");
            }

            // تهيئة بيانات اللعبة
            const gameData = {
                players: {},
                currentRound: 0,
                gameState: "playing",
                gameStartTime: Date.now(),
                gameStarter: event.senderID
            };

            // تعيين 3 قلوب لكل لاعب
            for (const player of allParticipants) {
                gameData.players[player] = {
                    hearts: 3,
                    name: "",
                    score: 0
                };
            }

            // الحصول على أسماء اللاعبين
            try {
                const userInfos = await api.getUserInfo(allParticipants);
                for (const id in userInfos) {
                    if (gameData.players[id]) {
                        gameData.players[id].name = userInfos[id].name;
                    }
                }
            } catch (e) {
                console.error("خطأ في جلب أسماء اللاعبين:", e);
            }

            // بدء الجولة الأولى
            message.reply(
                `🎮 | بدأت لعبة الموت مع ${allParticipants.length} لاعبين!\n` +
                `✧━━━━━━━━━━━━━━━━━✧\n` +
                `💖 | كل لاعب لديه 3 قلوب\n` +
                `🗡️ | الفائز في كل جولة يختار لاعبًا لقتله\n` +
                `✧━━━━━━━━━━━━━━━━━✧\n` +
                `🛠️ | الأوامر المتاحة:\n` +
                `- "الحالة": لعرض حالة اللعبة\n` +
                `- "إنهاء": لإنهاء اللعبة (للمشرف فقط)\n` +
                `✧━━━━━━━━━━━━━━━━━✧`
            );

            startNewRound(message, gameData);
        } catch (err) {
            console.error("حدث خطأ في بدء اللعبة:", err);
            message.reply("❌ | حدث خطأ غير متوقع أثناء بدء اللعبة!");
        }
    },


    onReply: async ({ message, event, Reply, api }) => {
        const input = event.body.trim();
        const senderID = event.senderID;

        // معالجة الأوامر الخاصة
        if (input === "الحالة") {
            return sendGameStatus(message, Reply.gameData);
        }

        if (input === "إنهاء") {
            if (senderID === Reply.gameData.gameStarter) {
                return endGame(message, Reply.gameData, "تم إنهاء اللعبة بواسطة المنشئ");
            }
            return message.reply("❌ | فقط منشئ اللعبة يمكنه إنهاؤها!");
        }

        if (!Reply) return;

        const { gameData, correctAnswer, gameType, choosingKill } = Reply;

        // التحقق من أن اللعبة لا تزال جارية
        if (gameData.gameState !== "playing" && gameData.gameState !== "final") {
            return message.reply("❌ | اللعبة انتهت بالفعل!");
        }

        // معالجة اختيار القتل
        if (choosingKill && senderID === Reply.author) {
            return handleKillChoice(message, event, gameData, input);
        }

        // معالجة لعبة XO
        if (gameData.gameState === "final" && gameData.xo) {
            return handleXOMove(message, event, gameData, input);
        }

        // التحقق من أن اللاعب ما زال في اللعبة
        if (!gameData.players[senderID] || gameData.players[senderID].hearts <= 0) {
            return message.reply("❌ | لقد تم طردك من اللعبة!");
        }

        // التحقق من الإجابة
        const isCorrect = checkAnswer(input, correctAnswer, Reply.options);
        if (isCorrect) {
            handleCorrectAnswer(message, event, gameData);
        } else {
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
        return endGame(message, gameData);
    }

    // اختيار لعبة عشوائية للجولة
    const gameType = ["ايموجي", "اعلام", "عاصمة"][Math.floor(Math.random() * 3)];
    gameData.currentGame = gameType;

    // تحضير السؤال حسب نوع اللعبة
    const { question, correctAnswer, options } = prepareQuestion(gameType);
    
    // إرسال السؤال
    message.reply(question, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
            commandName: "لعبة-الموت",
            messageID: info.messageID,
            gameData,
            correctAnswer,
            gameType,
            options
        });
    });
}

function prepareQuestion(gameType) {
    let question, correctAnswer, options;
    
    switch (gameType) {
        case "ايموجي":
            const emojis = JSON.parse(fs.readFileSync('emojie.json'));
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            question = `✧━━━━━━━━━━━━━━━━━✧\n🎮 | الجولة ${gameData.currentRound} (الإيموجي)\nما هو الإيموجي الذي يتناسب مع:\n"${randomEmoji.description}"\n✧━━━━━━━━━━━━━━━━━✧`;
            correctAnswer = randomEmoji.emoji;
            break;
            
        case "اعلام":
            const flags = JSON.parse(fs.readFileSync('flags.json'));
            const randomFlag = flags[Math.floor(Math.random() * flags.length)];
            options = prepareOptions(randomFlag.name, flags, 'name');
            question = `✧━━━━━━━━━━━━━━━━━✧\n🎮 | الجولة ${gameData.currentRound} (الأعلام)\nما هو اسم هذا العلم؟\n${formatOptions(options)}\n✧━━━━━━━━━━━━━━━━━✧`;
            correctAnswer = randomFlag.name;
            break;
            
        case "عاصمة":
            const capitals = JSON.parse(fs.readFileSync('capitals.json'));
            const randomCapital = capitals[Math.floor(Math.random() * capitals.length)];
            options = prepareOptions(randomCapital.capital, capitals, 'capital');
            question = `✧━━━━━━━━━━━━━━━━━✧\n🎮 | الجولة ${gameData.currentRound} (العواصم)\nما هي عاصمة ${randomCapital.country}؟\n${formatOptions(options)}\n✧━━━━━━━━━━━━━━━━━✧`;
            correctAnswer = randomCapital.capital;
            break;
    }
    
    return { question, correctAnswer, options };
}

function prepareOptions(correct, list, key) {
    let wrongOptions = [];
    while (wrongOptions.length < 2) {
        const random = list[Math.floor(Math.random() * list.length)];
        if (random[key] !== correct && !wrongOptions.includes(random[key])) {
            wrongOptions.push(random[key]);
        }
    }
    return [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
}

function formatOptions(options) {
    return options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
}

function checkAnswer(input, correctAnswer, options) {
    if (!options) return input === correctAnswer;
    
    if (!isNaN(input)) {
        const index = parseInt(input) - 1;
        if (index >= 0 && index < options.length) {
            return options[index] === correctAnswer;
        }
    }
    return input === correctAnswer;
}

function handleCorrectAnswer(message, event, gameData) {
    const senderID = event.senderID;
    gameData.lastWinner = senderID;
    gameData.players[senderID].score++;
    
    const remainingPlayers = getRemainingPlayers(gameData);
    if (remainingPlayers.length === 2) {
        gameData.gameState = "final";
        return startXOGame(message, gameData);
    }

    message.reply(
        `🎉 | ${gameData.players[senderID].name} فاز بالجولة!\n` +
        `✧━━━━━━━━━━━━━━━━━✧\n` +
        `اللاعبون المتبقون:\n${getPlayersList(gameData)}\n` +
        `✧━━━━━━━━━━━━━━━━━✧`
    );
    
    message.reply(
        `🗡️ | اختر لاعبًا لقتله:\n${getPlayersList(gameData, true)}\n` +
        `✧━━━━━━━━━━━━━━━━━✧\n` +
        `أو اكتب "تخطي" لتخطي القتل`,
        (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: "لعبة-الموت",
                messageID: info.messageID,
                author: senderID,
                gameData,
                choosingKill: true
            });
        }
    );
}

function handleKillChoice(message, event, gameData, input) {
    if (input.toLowerCase() === "تخطي") {
        message.reply("✅ | تم تخطي القتل. ننتقل للجولة التالية!");
        return startNewRound(message, gameData);
    }

    const choice = parseInt(input);
    const remainingPlayers = getRemainingPlayers(gameData);
    
    if (isNaN(choice) || choice < 1 || choice > remainingPlayers.length) {
        return message.reply("❌ | رجاءً أدخل رقمًا صحيحًا من القائمة!");
    }

    const targetID = remainingPlayers[choice - 1];
    gameData.players[targetID].hearts--;
    
    message.reply(`💔 | ${gameData.players[targetID].name} فقد قلبًا! (باقي له ${gameData.players[targetID].hearts} قلوب)`);
    
    if (gameData.players[targetID].hearts <= 0) {
        message.reply(`☠️ | ${gameData.players[targetID].name} تم طرده من اللعبة!`);
    }
    
    startNewRound(message, gameData);
}

function startXOGame(message, gameData) {
    const [player1, player2] = getRemainingPlayers(gameData);
    const board = Array(3).fill().map(() => Array(3).fill(' '));
    
    gameData.xo = {
        board,
        currentPlayer: player1,
        players: [player1, player2],
        symbols: { [player1]: '❌', [player2]: '⭕' }
    };
    
    message.reply(
        `✧━━━━━━━━━━━━━━━━━✧\n` +
        `🎮 | النهائي!\n` +
        `${gameData.players[player1].name} (❌) vs ${gameData.players[player2].name} (⭕)\n` +
        `✧━━━━━━━━━━━━━━━━━✧\n` +
        `${drawXOBorad(board)}\n` +
        `✧━━━━━━━━━━━━━━━━━✧\n` +
        `دور ${gameData.players[player1].name}: أرسل "رقم الصف رقم العمود" (مثال: 1 2)`
    );
}

function handleXOMove(message, event, gameData, input) {
    const { xo, players } = gameData;
    const senderID = event.senderID;

    if (senderID !== xo.currentPlayer) {
        return message.reply("❌ | ليس دورك للعب الآن!");
    }

    const [row, col] = input.split(' ').map(Number);
    if (!row || !col || row < 1 || row > 3 || col < 1 || col > 3) {
        return message.reply("❌ | أدخل رقم الصف والعمود (مثال: 1 2)");
    }

    if (xo.board[row-1][col-1] !== ' ') {
        return message.reply("❌ | هذه الخلية محجوزة!");
    }

    xo.board[row-1][col-1] = xo.symbols[senderID];

    if (checkXOWin(xo.board, xo.symbols[senderID])) {
        players[senderID].score += 3;
        return endGame(message, gameData, `🎉 | ${players[senderID].name} فاز بلعبة XO!`);
    }

    if (checkXODraw(xo.board)) {
        players[xo.players[0]].score++;
        players[xo.players[1]].score++;
        return endGame(message, gameData, "🤝 | تعادل في لعبة XO!");
    }

    xo.currentPlayer = xo.players.find(p => p !== senderID);
    message.reply(
        `✅ | حركة ناجحة!\n` +
        `✧━━━━━━━━━━━━━━━━━✧\n` +
        `${drawXOBorad(xo.board)}\n` +
        `✧━━━━━━━━━━━━━━━━━✧\n` +
        `دور ${players[xo.currentPlayer].name} (${xo.symbols[xo.currentPlayer]})`
    );
}

function endGame(message, gameData, customMessage = null) {
    gameData.gameState = "ended";
    const duration = Math.floor((Date.now() - gameData.gameStartTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const remainingPlayers = getRemainingPlayers(gameData);
    const sortedPlayers = Object.entries(gameData.players)
        .map(([id, player]) => ({ ...player, id }))
        .sort((a, b) => b.score - a.score);

    let resultMessage = customMessage || `🏁 | انتهت اللعبة بعد ${minutes} دقيقة و${seconds} ثانية!\n`;
    resultMessage += `✧━━━━━━━━━━━━━━━━━✧\n🎖️ النتائج النهائية:\n`;
    
    sortedPlayers.forEach((player, index) => {
        const rank = ["🥇", "🥈", "🥉"][index] || "▫️";
        resultMessage += `${rank} ${player.name}: ${player.score} نقطة (${player.hearts} قلوب)\n`;
    });

    if (remainingPlayers.length === 1) {
        resultMessage += `\n🎉 | ${gameData.players[remainingPlayers[0]].name} هو البطل النهائي!`;
    }

    message.reply(resultMessage);
}

function sendGameStatus(message, gameData) {
    const remainingPlayers = getRemainingPlayers(gameData);
    const duration = Math.floor((Date.now() - gameData.gameStartTime) / 1000);

    let status = `📊 | حالة اللعبة:\n` +
                 `✧━━━━━━━━━━━━━━━━━✧\n` +
                 `⏱️ المدة: ${duration} ثانية\n` +
                 `🎮 الجولة: ${gameData.currentRound}\n` +
                 `🕹️ اللعبة الحالية: ${gameData.currentGame || 'لم تبدأ'}\n` +
                 `👥 اللاعبون المتبقون: ${remainingPlayers.length}\n` +
                 `✧━━━━━━━━━━━━━━━━━✧\n` +
                 `${getPlayersList(gameData)}\n` +
                 `✧━━━━━━━━━━━━━━━━━✧\n` +
                 `🏆 المتصدرون:\n`;

    Object.entries(gameData.players)
        .filter(([id]) => gameData.players[id].hearts > 0)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 3)
        .forEach(([id, player], index) => {
            status += `${["🥇", "🥈", "🥉"][index]} ${player.name}: ${player.score} نقطة\n`;
        });

    message.reply(status);
}

function getRemainingPlayers(gameData) {
    return Object.keys(gameData.players).filter(id => gameData.players[id].hearts > 0);
}

function getPlayersList(gameData, numbered = false) {
    const players = getRemainingPlayers(gameData);
    return players.map((id, i) => 
        numbered ? `${i+1}. ${gameData.players[id].name} (${gameData.players[id].hearts} قلوب)`
                 : `- ${gameData.players[id].name} (${gameData.players[id].hearts} قلوب)`
    ).join('\n');
}

function drawXOBorad(board) {
    return board.map(row => row.join(' │ ')).join('\n───┼───┼───\n');
}

function checkXOWin(board, symbol) {
    // التحقق من الصفوف والأعمدة
    for (let i = 0; i < 3; i++) {
        if ((board[i][0] === symbol && board[i][1] === symbol && board[i][2] === symbol) ||
            (board[0][i] === symbol && board[1][i] === symbol && board[2][i] === symbol)) {
            return true;
        }
    }
    // التحقق من القطرين
    return (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) ||
           (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol);
}

function checkXODraw(board) {
    return board.flat().every(cell => cell !== ' ');
              }
