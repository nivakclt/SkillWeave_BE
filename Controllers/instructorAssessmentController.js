const InstructorAssessment = require('../Models/instructorAssessmentModel')
const InstructorApplication = require('../Models/instructorApplicationModel')

// Admin creates an assessment
const createAssessment = async (req, res) => {
    try {
        const { applicationId, questions } = req.body

        if (!applicationId || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json('Application ID and questions are required')
        }

        const application = await InstructorApplication.findById(applicationId)

        if (!application) {
            return res.status(404).json('Application not found')
        }

        if (application.status !== 'pending') {
            return res.status(400).json('Application is not pending')
        }

        const existing = await InstructorAssessment.findOne({
            application: applicationId
        })

        if (existing) {
            return res.status(409).json('Assessment already exists')
        }

        const assessment = await InstructorAssessment.create({
            application: applicationId,
            teachingDomain: application.teachingDomain,
            questions
        })

        return res.status(201).json({
            message: 'Assessment created successfully',
            assessmentId: assessment._id
        })

    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json(error.message)
        }

        return res.status(500).json('Internal Server Error')
    }
}

// Applicant views their assessment
const getMyAssessment = async (req, res) => {
    try {
        const application = await InstructorApplication.findOne({
            applicant: req.user.userId
        })

        if (!application) {
            return res.status(404).json('Application not found')
        }

        const assessment = await InstructorAssessment.findOne({
            application: application._id
        }).select('-questions.correctAnswer')

        if (!assessment) {
            return res.status(404).json('Assessment not created yet')
        }

        return res.status(200).json(assessment)

    } catch (error) {
        return res.status(500).json('Internal Server Error')
    }
}

const submitAssessment = async (req, res) => {
    try {
        const { answers } = req.body

        const application = await InstructorApplication.findOne({
            applicant: req.user.userId,
            status: 'pending'
        })

        if (!application) {
            return res.status(404).json('Pending application not found')
        }

        const assessment = await InstructorAssessment.findOne({
            application: application._id
        })

        if (!assessment) {
            return res.status(404).json('Assessment not found')
        }

        if (assessment.status === 'submitted') {
            return res.status(409).json('Assessment already submitted')
        }

        if (
            !Array.isArray(answers) ||
            answers.length !== assessment.questions.length ||
            !answers.every(
                (answer) =>
                    Number.isInteger(answer) &&
                    answer >= 0 &&
                    answer <= 3
            )
        ) {
            return res.status(400).json('Invalid answers')
        }

        let correctCount = 0

        assessment.questions.forEach((question, index) => {
            if (question.correctAnswer === answers[index]) {
                correctCount++
            }
        })

        const score = Math.round(
            (correctCount / assessment.questions.length) * 100
        )

        const updatedAssessment = await InstructorAssessment.findOneAndUpdate(
            {
                _id: assessment._id,
                status: 'pending'
            },
            {
                score,
                status: 'submitted',
                submittedAt: new Date()
            },
            { new: true }
        )

        if (!updatedAssessment) {
            return res.status(409).json('Assessment already submitted')
        }

        return res.status(200).json({
            message: 'Assessment submitted successfully',
            score: updatedAssessment.score,
            status: updatedAssessment.status
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal Server Error')
    }
}
module.exports = {
    createAssessment,
    getMyAssessment,submitAssessment
}