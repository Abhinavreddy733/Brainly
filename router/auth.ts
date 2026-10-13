import express from 'express'
import { SignJWT, jwtVerify } from 'jose'
import { AuthMiddleware, sendResponse } from '../middleware'
import { ResponseStatus, type ResponseStatusType } from '../responseStatus'
import { prisma } from "../db";
import * as z from "zod";
const router = express.Router();

//signIn, signup, 

const secret = new TextEncoder().encode("ABHINAV"!)

const AuthSchema = z.object({
    username: z.string(),
    password: z.string().min(6),
    email: z.email()
})

const AuthSigninSchema = z.object({
    email: z.string(),
    password: z.string().min(6),
})

router.post('/signup', async (req, res) => {
    const { data, success } = AuthSchema.safeParse(req.body);
    
    if (!success) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }

    const username = data.username;
    const email = data.email
    const password = await Bun.password.hash(data.password);

    return prisma.$transaction(async (tx) => {
        const user = await prisma.user.create({
            data: { username, password, email }
        })

        if (!user) {
            return sendResponse(res, ResponseStatus.INTERNAL_ERROR);
        }

        const token = await new SignJWT({ id: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret)

        return sendResponse(res, ResponseStatus.SUCCESS, token);
    })
})

router.post('/signin', async (req, res) => {
    
    const { data, success } = AuthSigninSchema.safeParse(req.body);
    
    if (!success) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST);
    }

    const email = data.email;

    return prisma.$transaction(async (tx) => {
        const user = await prisma.user.findFirst({
            where: {email}
        })

        if (!user) {
            return sendResponse(res, ResponseStatus.NOT_FOUND);
        }

        const verifyPassword = await Bun.password.verify(data.password, user.password);

        if(!verifyPassword) {
            return sendResponse(res, ResponseStatus.BAD_REQUEST);
        }

        const token = await new SignJWT({ id: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret)

        return sendResponse(res, ResponseStatus.SUCCESS, token);
    })
})

export default router