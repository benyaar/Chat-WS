import {Router} from "express";

export const route = Router()

route.get('/', (req, res) => {
    res.json('Its Work')
    console.log()
})