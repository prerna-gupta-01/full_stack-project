import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    modelName: "User",
    fields: {
      name: "fullName",
    },
    additionalFields: {
      studentId: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const existingUser = await prisma.user.findUnique({
            where: { studentId: user.studentId as string },
          });
          if (existingUser) {
            // Throw a recognizable error message
            throw new APIError("BAD_REQUEST", { message: "User with this student ID already exists" });
          }
          return { data: user };
        }
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
