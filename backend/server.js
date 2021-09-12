import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV == "development") {
    app.use(morgan("dev"));
}

app.use(express.json());

app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/config/paypal", (req, res) => {
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.get("/api/config/stripe", (req, res) => {
    res.json({ stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

const __dirname = path.resolve();
app.use(
    "/uploads",
    express.static(path.join(__dirname.toString(), "/uploads"))
);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(
            path.resolve(__dirname, "frontend", "build", "index.html")
        );
    });
} else {
    app.get("/", (req, res) => {
        res.send("Server.js API");
    });
}

//Not Found
app.use(notFound);
//Error MiddleWare
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(
        `Server Running in ${process.env.NODE_ENV} mode On Port ${PORT}`
    )
);
