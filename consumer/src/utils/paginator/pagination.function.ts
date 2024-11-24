import { paginator } from '@nodeteam/nestjs-prisma-pagination';

type PaginateOptions = Parameters<ReturnType<typeof paginator>>;
type PaginateObject<FindManyArgs> = {
  prismaQueryModel: any;
  findManyArgs?: FindManyArgs;
  paginateOptions?: PaginateOptions[2];
};

/**
 *
 * @summary
 * This function allows you to easily paginate your prisma findMany queries.
 *
 * @example
 * paginate<EntityType, EntityFindManyArgs>({
 *  prismaQueryModel : < your prisma model >,
 *  findManyArgs : < your prisma findMany args >,
 *  paginateOptions : < your paginate options >
 * });
 *
 * @example
 * paginate<Organization, Prisma.OrganizationFindManyArgs>({
 *     prismaQueryModel: this.prisma.organization,
 *     findManyArgs: {
 *       where: {
 *         ORG_DataStatus: {
 *           not: DataStatus.Deleted,
 *         },
 *         ORG_DeletedTime: null,
 *         ORG_DeletedUser: null,
 *       },
 *     },
 *     paginateOptions: {
 *       page: 1,
 *       perPage: 10,
 *     },
 *   });
 *
 */
export function paginate<EntityType, FindManyArgs>({
  prismaQueryModel,
  findManyArgs,
  paginateOptions,
}: PaginateObject<FindManyArgs>) {
  const paginateFunction = paginator({});
  return paginateFunction<EntityType, FindManyArgs>(
    prismaQueryModel,
    findManyArgs,
    paginateOptions,
  );
}
