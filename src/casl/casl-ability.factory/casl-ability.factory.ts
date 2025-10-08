import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { CaslAction } from "../dto/caslAction.enum";


class Article {
    id: number;
    isPublished: boolean;
    authorId: number;
}

class User {
    id: number;
    isAdmin: boolean;
}

type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = MongoAbility<[CaslAction, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        if (user.isAdmin) {
            can(CaslAction.Manage, 'all'); // read-write access to everything
        } else {
            can(CaslAction.Read, 'all'); // read-only access to everything
        }

        can(CaslAction.Update, Article, { authorId: user.id });
        cannot(CaslAction.Delete, Article, { isPublished: true });

        return build({
            // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
