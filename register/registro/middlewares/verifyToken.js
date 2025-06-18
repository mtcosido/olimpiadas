import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: "No autorizado. Token faltante." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token inválido:", error.message);
        return res.status(403).json({ error: "Token inválido." });
    }
}
