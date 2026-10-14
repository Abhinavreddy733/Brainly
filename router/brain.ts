import express from 'express'
import { SignJWT, jwtVerify } from 'jose'
import { userMiddleware, sendResponse } from '../middleware'
import { ResponseStatus, type ResponseStatusType } from '../responseStatus'
import { prisma } from "../db";
import * as z from "zod";
const router = express.Router();

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  link: z.string().trim().url(),
  type: z.string().trim().min(1),
  share: z.boolean().default(false),
  tags: z
    .array(z.string().trim().min(1).max(30))
    .max(2, "You can add at most 2 tags")
    .default([]),
});

const updateSchema = createSchema.partial();

router.post('/create', async (req, res) => {

    const {data, success} = createSchema.safeParse(req.body);
    //@ts-ignore
    const userId = req.user.id;

    if(!success) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST)
    }

    const created = await prisma.content.create({
        data: {
            title: data.title,
            link: data.link,
            share: data.share,
            type: data.type,
            userId,
            tags: {
                create: data.tags.map((tagName) => ({ tagName })),
            }
        }
    })

    if(!created) {
        return sendResponse(res, ResponseStatus.INTERNAL_ERROR)
    }

    return sendResponse(res, ResponseStatus.SUCCESS, created)

})

router.put('/update/:contentId', async (req, res) => {
    //@ts-ignore
    const userId = req.user.id;
    const contentId = Number(req.params.contentId)
    const {data, success} = updateSchema.safeParse(req.body);

    if(!success) {
        return sendResponse(res, ResponseStatus.BAD_REQUEST)
    }

    const updateContent = await prisma.content.update({
        where: { id:contentId, userId },
        data: {
            title: data.title,
            link:data.link,
            share: data.share,
            type: data.type,
            tags: data.tags
          ? {
              deleteMany: {},
              create: data.tags.map((tagName) => ({ tagName })),
            }
          : undefined,
        }
    })

    if(!updateContent) {
        return sendResponse(res, ResponseStatus.INTERNAL_ERROR)
    }

    return sendResponse(res, ResponseStatus.SUCCESS, updateContent)
})

router.get('/:contentId', async (req, res) => {
    const contentId = Number(req.params.contentId);
    //@ts-ignore
    const userId = req.user.id;

    try {
        const contentData = await prisma.content.findFirst({
            where:{ id:contentId }
        })

        if((userId != contentData?.userId) && (contentData?.share == false)) {
            return sendResponse(res, ResponseStatus.UNAUTHORIZED)
        }

        return sendResponse(res, ResponseStatus.SUCCESS, contentData)
    }catch(error) {
        return sendResponse(res, ResponseStatus.INTERNAL_ERROR, error)
    }
})

router.put('/share/:contentId', async (req, res) => {
    const contentId = Number(req.params.contentId);
    //@ts-ignore
    const userId = req.user.id;

    try {
        const updateShare = await prisma.content.update({
            where: {id: contentId, userId},
            data: { share: true }
        })

        return sendResponse(res, ResponseStatus.NO_CONTENT)

    }catch(err) {
        return sendResponse(res, ResponseStatus.INTERNAL_ERROR, err)
    }
})

router.delete('/:contentId', async (req, res) => {
    const contentId = Number(req.params.contentId);
    //@ts-ignore
    const userId = req.user.id;

    try {
        const deleteContent = await prisma.content.delete({
            where: {id: contentId, userId}
        })

        return sendResponse(res, ResponseStatus.NO_CONTENT)

    }catch(err) {
        return sendResponse(res, ResponseStatus.INTERNAL_ERROR)
    }
})

export default router