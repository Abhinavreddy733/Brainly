import express from 'express'
import { SignJWT, jwtVerify } from 'jose'
import { userMiddleware, sendResponse } from '../middleware'
import { ResponseStatus, type ResponseStatusType } from '../responseStatus'
import { prisma } from "../db";
import * as z from "zod";
const router = express.Router();

router.post('/create',userMiddleware, async(req, res) => {

})

router.post('/update',userMiddleware, async(req, res) => {
    
})

router.get('/',userMiddleware, async(req, res) => {
    
})

router.post('/share',userMiddleware, async(req, res) => {
    
})

router.get('/shareId',userMiddleware, async(req, res) => {
    
})

router.post('/delete',userMiddleware, async(req, res) => {
    
})

export default router