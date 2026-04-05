import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Context } from "./context";
import { signJWT } from "../lib/jwt";

const t = initTRPC.context<Context>().create();

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.adminEmail) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, adminEmail: ctx.adminEmail } });
});

const publicProcedure = t.procedure;
const adminProcedure = t.procedure.use(isAdmin);

const StatusSchema = z.enum(["pending", "confirmed", "completed", "cancelled"]);

const AppointmentSchema = z.object({
  id: z.number(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  serviceAddress: z.string(),
  preferredDate: z.string().nullable(),
  preferredTime: z.string().nullable(),
  services: z.array(z.string()),
  notes: z.string().nullable(),
  status: StatusSchema,
  createdAt: z.string(),
});

type Appointment = z.infer<typeof AppointmentSchema>;

async function getAppointments(ctx: Context): Promise<Appointment[]> {
  if (!ctx.env.APPOINTMENTS) return [];
  const raw = await ctx.env.APPOINTMENTS.get("appointments");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Appointment[];
  } catch {
    return [];
  }
}

async function saveAppointments(
  ctx: Context,
  appointments: Appointment[]
): Promise<void> {
  if (!ctx.env.APPOINTMENTS) return;
  await ctx.env.APPOINTMENTS.put("appointments", JSON.stringify(appointments));
}

export const appRouter = t.router({
  admin: t.router({
    me: publicProcedure.query(({ ctx }) => {
      return ctx.adminEmail ? { email: ctx.adminEmail } : null;
    }),

    login: publicProcedure
      .input(z.object({ email: z.string(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const adminEmail = ctx.env.ADMIN_EMAIL ?? "admin@renelsoutdoor.com";
        const adminPassword = ctx.env.ADMIN_PASSWORD ?? "changeme";
        if (input.email !== adminEmail || input.password !== adminPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials. Try again.",
          });
        }
        const token = await signJWT({ email: input.email }, ctx.env.JWT_SECRET);
        ctx.setCookie("session", token);
        return { email: input.email };
      }),

    logout: adminProcedure.mutation(({ ctx }) => {
      ctx.clearCookie("session");
      return null;
    }),
  }),

  appointments: t.router({
    list: adminProcedure
      .input(z.object({ limit: z.number(), offset: z.number() }))
      .query(async ({ ctx, input }) => {
        const all = await getAppointments(ctx);
        return all.slice(input.offset, input.offset + input.limit);
      }),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: StatusSchema }))
      .mutation(async ({ ctx, input }) => {
        const appointments = await getAppointments(ctx);
        const idx = appointments.findIndex((a) => a.id === input.id);
        if (idx === -1) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Appointment not found.",
          });
        }
        appointments[idx] = { ...appointments[idx]!, status: input.status };
        await saveAppointments(ctx, appointments);
        return appointments[idx]!;
      }),
  }),
});

export type AppRouter = typeof appRouter;
