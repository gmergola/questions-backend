const db = require("../db");
const ExpressError = require("../expressError");

/**Question: class for querying database to get questions and answers */
class Question {

  /**getAll: get all questions */
  static async getAll() {
    const result = await db.query(
      `SELECT * FROM questions`
    );

    let questions = result.rows;

    let response = questions.map(question => (
      {
        question_main: question.question_main,
        question: question.question
      }));

    return { questions: response };
  }

  /**get: get a question by it's "id" --> question_main */
  static async get(question_main) {
    const result = await db.query(
      `SELECT questions.question,
                answers.answer,
                answers.vote,
                answers.id,
                answer_options.answer_option
          FROM questions
            FULL JOIN answers ON questions.question_main = answers.question_main
            FULL JOIN answer_options on answer_options.answer_id = answers.id
          WHERE questions.question_main = $1`,
      [question_main]);

    let answers = result.rows;

    if (answers.length === 0) {
      throw new ExpressError(`No such Question with question_main: ${question_main}`, 404);
    }

    function structureAnswers() {
      let answersData = [];
      let seenAnswers = [];
      let answerOptionsData = {};

      for (let answer of answers) {
        if (answerOptionsData[answer.answer] === undefined) {
          answerOptionsData[answer.answer] = [answer.answer_option];
        } else {
          answerOptionsData[answer.answer].push(answer.answer_option);
        }
      }

      for (let answer of answers) {
        if (!seenAnswers.includes(answer.answer)) {
          seenAnswers.push(answer.answer)
          answersData.push({
            id: answer.id,
            answer: answer.answer,
            vote: answer.vote,
            options: answerOptionsData[answer.answer][0] !== null ?
              answerOptionsData[answer.answer] :
              []
          });
        }
      }
      return answersData;
    }

    return {
      question: answers[0].question,
      answers: structureAnswers()
    }
  }
}

module.exports = Question;